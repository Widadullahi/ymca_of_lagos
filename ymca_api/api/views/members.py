import base64
import csv
import io
import logging
import uuid
import openpyxl
import requests
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.mail import get_connection
from django.core.mail import send_mail
from django.http import HttpResponse
from datetime import date, timedelta
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db import transaction,IntegrityError
from django.utils import timezone
from django.db.models import Count
from django.db.models.functions import TruncMonth
from account.models import Category, Church, EmailVerification, IDCard, User, UserRequest, YouthGroup, RequestStatus
from account.serializers import IDCardSerializer, RegisterSerializer
from account.serializers import UserSerializer
from api.serializers.members import (
    EmailVerificationCodeSerializer,
    EmailVerificationRequestSerializer,
    UserRequestListSerializer,
    UserRequestSerializer,
)
from api.utils.response.response_format import success_response, paginate_success_response, bad_request_response,internal_server_error_response

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from openpyxl.worksheet.datavalidation import DataValidation

logger = logging.getLogger(__name__)


def send_verification_email(recipient_email: str, verification_code: str) -> None:
    subject = 'YMCA Lagos Email Verification Code'
    text_body = f"Your YMCA Lagos verification code is {verification_code}. This code expires in 10 minutes."
    html_body = (
        "<p>Your YMCA Lagos verification code is "
        f"<strong>{verification_code}</strong>.</p>"
        "<p>This code expires in 10 minutes.</p>"
    )

    if settings.RESEND_API_KEY:
        response = requests.post(
            settings.RESEND_API_URL,
            headers={
                'Authorization': f'Bearer {settings.RESEND_API_KEY}',
                'Content-Type': 'application/json',
            },
            json={
                'from': settings.DEFAULT_FROM_EMAIL,
                'to': [recipient_email],
                'subject': subject,
                'text': text_body,
                'html': html_body,
            },
            timeout=getattr(settings, 'EMAIL_TIMEOUT', 15),
        )

        if not response.ok:
            try:
                error_payload = response.json()
            except ValueError:
                error_payload = response.text
            raise RuntimeError(f'Resend API error: {error_payload}')

        return

    connection = get_connection(timeout=getattr(settings, 'EMAIL_TIMEOUT', 15))
    send_mail(
        subject,
        text_body,
        settings.DEFAULT_FROM_EMAIL,
        [recipient_email],
        connection=connection,
        fail_silently=False,
    )


class SendEmailVerificationCodeView(generics.GenericAPIView):
    permission_classes = []
    serializer_class = EmailVerificationRequestSerializer

    @staticmethod
    def _looks_like_placeholder(value: str | None) -> bool:
        if not value:
            return True
        normalized = value.strip().lower()
        placeholder_markers = (
            'your-email@outlook.com',
            'your-app-password',
            'your-secret-key-here',
            'example.com',
            'changeme',
            'replace-me',
        )
        return any(marker in normalized for marker in placeholder_markers)

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            email = serializer.validated_data['email']
            masked_password = ''
            if settings.EMAIL_HOST_PASSWORD:
                masked_password = '*' * min(len(settings.EMAIL_HOST_PASSWORD), 8)
            logger.info(
                'Email config debug: %s',
                {
                    'EMAIL_HOST': settings.EMAIL_HOST,
                    'EMAIL_PORT': settings.EMAIL_PORT,
                    'EMAIL_USE_TLS': settings.EMAIL_USE_TLS,
                    'EMAIL_HOST_USER': settings.EMAIL_HOST_USER,
                    'DEFAULT_FROM_EMAIL': settings.DEFAULT_FROM_EMAIL,
                    'EMAIL_HOST_PASSWORD_SET': bool(settings.EMAIL_HOST_PASSWORD),
                    'EMAIL_HOST_PASSWORD_MASK': masked_password,
                    'RESEND_API_KEY_SET': bool(settings.RESEND_API_KEY),
                }
            )
            if settings.RESEND_API_KEY and self._looks_like_placeholder(settings.DEFAULT_FROM_EMAIL):
                return internal_server_error_response(
                    message='Email delivery is not configured on the server. Set a valid DEFAULT_FROM_EMAIL for your email provider.'
                )

            if settings.RESEND_API_KEY:
                delivery_method = 'resend'
            else:
                delivery_method = 'smtp'

            if (
                delivery_method == 'smtp'
                and (
                    not settings.EMAIL_HOST_USER
                    or not settings.EMAIL_HOST_PASSWORD
                    or not settings.DEFAULT_FROM_EMAIL
                    or self._looks_like_placeholder(settings.EMAIL_HOST_USER)
                    or self._looks_like_placeholder(settings.EMAIL_HOST_PASSWORD)
                    or self._looks_like_placeholder(settings.DEFAULT_FROM_EMAIL)
                )
            ):
                return internal_server_error_response(
                    message='SMTP email delivery is not configured on the server. Configure a valid SMTP account or set RESEND_API_KEY to use the Resend email API.'
                )

            verification = EmailVerification.objects.filter(email__iexact=email).first()
            if verification:
                verification.refresh_code()
                verification.save()
            else:
                verification = EmailVerification.objects.create(
                    email=email,
                    code=EmailVerification.generate_code(),
                    expires_at=timezone.now() + timedelta(minutes=10),
                )

            send_verification_email(email, verification.code)
        except Exception:
            logger.exception('Email verification send failed')
            return internal_server_error_response(
                message='Unable to send verification code right now. Please try again.'
            )

        return success_response(
            message='Verification code sent successfully',
            data={'email': email}
        )


class VerifyEmailVerificationCodeView(generics.GenericAPIView):
    permission_classes = []
    serializer_class = EmailVerificationCodeSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        code = serializer.validated_data['code']
        verification = EmailVerification.objects.filter(email__iexact=email).first()

        if not verification:
            return bad_request_response(message='Please request a verification code first')

        if verification.expires_at < timezone.now():
            return bad_request_response(message='Verification code has expired. Please request a new one')

        if verification.code != code:
            return bad_request_response(message='Invalid verification code')

        verification.is_verified = True
        verification.verified_at = timezone.now()
        verification.save(update_fields=['is_verified', 'verified_at', 'updated_at'])

        return success_response(
            message='Email verified successfully',
            data={'email': email, 'verified': True}
        )


class AdminGetMemberOverview(generics.GenericAPIView):
    permission_classes = [IsAdminUser]
    queryset = User.objects.filter(is_admin=False)

    def get(self, request):
        overview = request.GET.get('overview')

        # Use one base queryset for all cases
        queryset = User.objects.filter(is_admin=False)
        response = {}

        if overview == 'gender':
            # Get gender breakdown counts from linked UserRequest
            gender_counts = queryset.filter(user_request__isnull=False).values('user_request__gender').annotate(count=Count('id'))
            
            # Create a dictionary for easy lookup
            gender_count_dict = {item['user_request__gender']: item['count'] for item in gender_counts}
            
            response = [
                {"name": 'Male', 'value': gender_count_dict.get('Male', 0)},
                {"name": 'Female', 'value': gender_count_dict.get('Female', 0)},
                {'name': 'Other', 'value': gender_count_dict.get('Other', 0)}
            ]

        elif overview == 'month':
            from datetime import datetime
            import calendar
            from django.db.models import Q

            # Get current year
            current_year = datetime.now().year
            
            # Get monthly counts for the current year
            monthly_counts = queryset.filter(
                Q(created_at__year=current_year) & 
                Q(created_at__isnull=False)
            ).annotate(
                month=TruncMonth('created_at')
            ).values('month').annotate(
                members=Count('id')
            ).order_by('month')
            
            # Convert to dictionary for lookup
            month_data = {
                entry['month'].month: entry['members'] 
                for entry in monthly_counts
            }
            
            # Create a list with all months, using 0 for months with no signups
            response = [
                {
                    'month': calendar.month_abbr[month], 
                    'members': month_data.get(month, 0)
                }
                for month in range(1, 13)
            ]

        else:
            # Default: Total, active, and inactive counts
            total = queryset.count()
            total_active = queryset.filter(is_active=True).count()
            total_inactive = queryset.filter(is_active=False).count()

            response = {
                'total': total,
                'active': total_active,
                'inactive': total_inactive,
                'new': total  # For now, 'new' will return total count as a placeholder
            }

        return success_response(
            data=response
        )

class AdminMembersBulkUploadView(generics.GenericAPIView):
    queryset = User.objects.filter(is_admin=False)
    serializer_class = RegisterSerializer
    parser_classes = (MultiPartParser, FormParser)
    permission_classes = [IsAdminUser]

    TEMPLATE_HEADERS = [
        'name',
        'email',
        'phoneNumber',
        'membershipType',
        'unit',
        'councilChurch',
        'youthCouncilGroup',
        'club',
        'gender',
        'validIdType',
        'validIdNumber',
        'passportUrl',
        'validIdDocumentUrl',
        'signatureUrl',
        'status',
    ]
    MEMBERSHIP_TYPE_MAP = {
        'full': 'full',
        'full member': 'full',
        'ordinary': 'ordinary',
        'ordinary member': 'ordinary',
        'honorary': 'honorary',
        'honorary member': 'honorary',
        'life': 'life',
        'life member': 'life',
    }
    UNIT_MAP = {
        'council of church': 'Council of Church',
        'youth council': 'Youth Council',
        "y's men": "Y's Men",
        'ys men': "Y's Men",
        'central club': 'Central Club',
    }
    VALID_ID_TYPE_MAP = {
        'national_id': 'national_id',
        'national identity number (nin)': 'national_id',
        'national identity number': 'national_id',
        'nin': 'national_id',
        'drivers_license': 'drivers_license',
        "driver's license": 'drivers_license',
        'drivers license': 'drivers_license',
        'voters_card': 'voters_card',
        "voter's card": 'voters_card',
        'voters card': 'voters_card',
        'international_passport': 'international_passport',
        'international passport': 'international_passport',
        'bvn': 'bvn',
    }
    GENDER_MAP = {
        'male': 'Male',
        'female': 'Female',
        'other': 'Other',
    }
    STATUS_MAP = {
        'active': True,
        'inactive': False,
    }
    PLACEHOLDER_PASSPORT = base64.b64decode(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnM4xkAAAAASUVORK5CYII='
    )

    @staticmethod
    def _normalize_key(value):
        return ''.join(char.lower() for char in str(value or '') if char.isalnum())

    @classmethod
    def _normalize_choice(cls, value, mapping, field_name):
        raw_value = str(value or '').strip()
        if not raw_value:
            return None

        normalized = raw_value.lower()
        if normalized in mapping:
            return mapping[normalized]

        collapsed = ' '.join(raw_value.split()).lower()
        if collapsed in mapping:
            return mapping[collapsed]

        raise ValueError(f'Invalid {field_name}: {raw_value}')

    @classmethod
    def _get_value(cls, row, *keys):
        for key in keys:
            normalized_key = cls._normalize_key(key)
            if normalized_key in row:
                return str(row[normalized_key] or '').strip()
        return ''

    @staticmethod
    def _split_name(full_name):
        parts = [part for part in str(full_name or '').strip().split() if part]
        if not parts:
            return '', ''
        if len(parts) == 1:
            return parts[0], ''
        return parts[0], ' '.join(parts[1:])

    @classmethod
    def _parse_rows(cls, file):
        filename = file.name.lower()

        if filename.endswith('.csv'):
            csv_data = file.read().decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(csv_data))
            rows = []
            for row in reader:
                rows.append({
                    cls._normalize_key(header): value
                    for header, value in row.items()
                    if header
                })
            return rows

        if filename.endswith('.xlsx'):
            workbook = openpyxl.load_workbook(file, data_only=True)
            worksheet = workbook.active
            values = list(worksheet.iter_rows(values_only=True))
            if not values:
                return []

            headers = [cls._normalize_key(value) for value in values[0]]
            rows = []
            for value_row in values[1:]:
                row = {}
                for index, header in enumerate(headers):
                    if header:
                        row[header] = value_row[index] if index < len(value_row) else ''
                rows.append(row)
            return rows

        raise ValueError('Please upload a CSV or Excel (.xlsx) file')

    @staticmethod
    def _fetch_remote_file(file_url, prefix):
        if not file_url:
            return None

        response = requests.get(file_url, timeout=15)
        response.raise_for_status()

        content_type = response.headers.get('Content-Type', '').lower()
        extension = 'jpg'
        if 'png' in content_type:
            extension = 'png'
        elif 'webp' in content_type:
            extension = 'webp'
        elif 'gif' in content_type:
            extension = 'gif'

        return ContentFile(
            response.content,
            name=f'{prefix}-{uuid.uuid4().hex}.{extension}'
        )

    @classmethod
    def _placeholder_passport_file(cls):
        return ContentFile(
            cls.PLACEHOLDER_PASSPORT,
            name=f'bulk-upload-passport-{uuid.uuid4().hex}.png'
        )

    def get(self, request, *args, **kwargs):
        workbook = openpyxl.Workbook()
        template_sheet = workbook.active
        template_sheet.title = 'Members'
        lists_sheet = workbook.create_sheet(title='Lists')

        membership_types = [label for _, label in User.MEMBERSHIP_TYPE_CHOICES]
        units = ['Council of Church', 'Youth Council', "Y's Men", 'Central Club']
        valid_id_types = [label for _, label in UserRequest._meta.get_field('valid_id_type').choices]
        genders = ['Male', 'Female', 'Other']
        statuses = ['Active', 'Inactive']
        churches = list(Church.objects.order_by('name').values_list('name', flat=True))
        youth_groups = list(YouthGroup.objects.order_by('name').values_list('name', flat=True))

        template_sheet.append(self.TEMPLATE_HEADERS)
        template_sheet.append([
            'John Doe',
            'john@example.com',
            '08012345678',
            'Full Member',
            'Council of Church',
            churches[0] if churches else '',
            '',
            '',
            'Male',
            'National Identity Number (NIN)',
            '12345678901',
            'https://example.com/passport.jpg',
            'https://example.com/valid-id.jpg',
            'https://example.com/signature.png',
            'Active',
        ])
        template_sheet.append([
            'Jane Smith',
            'jane@example.com',
            '08098765432',
            'Ordinary Member',
            'Youth Council',
            '',
            youth_groups[0] if youth_groups else '',
            '',
            'Female',
            "Driver's License",
            'DL-00012345',
            '',
            '',
            '',
            'Active',
        ])

        for cell in template_sheet[1]:
            cell.font = openpyxl.styles.Font(bold=True)

        lists_sheet['A1'] = 'Membership Types'
        lists_sheet['B1'] = 'Units'
        lists_sheet['C1'] = 'Council of Church'
        lists_sheet['D1'] = 'Youth Council Groups'
        lists_sheet['E1'] = 'Valid ID Types'
        lists_sheet['F1'] = 'Gender'
        lists_sheet['G1'] = 'Status'

        for column_index, values in enumerate(
            [membership_types, units, churches, youth_groups, valid_id_types, genders, statuses],
            start=1
        ):
            for row_index, value in enumerate(values, start=2):
                lists_sheet.cell(row=row_index, column=column_index, value=value)

        validation_ranges = {
            'D': ('A', len(membership_types)),
            'E': ('B', len(units)),
            'F': ('C', len(churches)),
            'G': ('D', len(youth_groups)),
            'J': ('E', len(valid_id_types)),
            'I': ('F', len(genders)),
            'O': ('G', len(statuses)),
        }

        for target_column, (list_column, item_count) in validation_ranges.items():
            if item_count == 0:
                continue
            validation = DataValidation(
                type='list',
                formula1=f"'Lists'!${list_column}$2:${list_column}${item_count + 1}",
                allow_blank=True,
            )
            validation.add(f'{target_column}2:{target_column}500')
            template_sheet.add_data_validation(validation)

        notes_sheet = workbook.create_sheet(title='Notes')
        notes = [
            'Required columns: name, email, phoneNumber.',
            'The system now generates ID numbers automatically. Do not add an id_number column.',
            'Use "Council of Church", "Youth Council", "Y\'s Men", or "Central Club" for unit.',
            'For Council of Church members, choose a value in the councilChurch column.',
            'For Youth Council members, choose a value in the youthCouncilGroup column.',
            'For Y\'s Men or Central Club, you can optionally use the club column.',
            'Membership type options: Full Member, Ordinary Member, Honorary Member, Life Member.',
            'validIdType, passportUrl, validIdDocumentUrl, and signatureUrl are optional.',
            'passportUrl, validIdDocumentUrl, and signatureUrl should be direct image links when provided.',
            'Status accepts Active or Inactive.',
        ]
        for index, note in enumerate(notes, start=1):
            notes_sheet.cell(row=index, column=1, value=note)

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="member_bulk_upload_template.xlsx"'
        workbook.save(response)
        return response
    
    def post(self, request, *args, **kwargs):
        """
        Handle CSV/Excel file upload for bulk member registration
        """
        if 'file' not in request.FILES:
            return bad_request_response(
                message='No file was provided'
            )
            
        file = request.FILES['file']
        
        if not (file.name.endswith('.csv') or file.name.endswith('.xlsx')):
            return bad_request_response(
                message='Please upload a CSV or Excel (.xlsx) file'
            )
        
        try:
            rows = self._parse_rows(file)
            processed_members = []
            errors = []
            first_error = None
            
            with transaction.atomic():
                for row_num, row in enumerate(rows, start=2):
                    try:
                        full_name = self._get_value(row, 'name', 'fullName')
                        first_name = self._get_value(row, 'firstName', 'first_name')
                        last_name = self._get_value(row, 'lastName', 'last_name')
                        if full_name and not first_name and not last_name:
                            first_name, last_name = self._split_name(full_name)

                        email = self._get_value(row, 'email').lower()
                        phone_number = self._get_value(row, 'phoneNumber', 'phone_number')

                        if not first_name and not last_name:
                            raise ValueError('Name is required')
                        if not email:
                            raise ValueError('Email is required')
                        if not phone_number:
                            raise ValueError('Phone number is required')

                        if User.objects.filter(email__iexact=email).exists() or UserRequest.objects.filter(email__iexact=email).exists():
                            raise ValueError(f'Email already exists: {email}')

                        membership_type = self._normalize_choice(
                            self._get_value(row, 'membershipType', 'membership_type'),
                            self.MEMBERSHIP_TYPE_MAP,
                            'membership type'
                        ) or 'full'
                        unit = self._normalize_choice(
                            self._get_value(row, 'unit'),
                            self.UNIT_MAP,
                            'unit'
                        )
                        gender = self._normalize_choice(
                            self._get_value(row, 'gender'),
                            self.GENDER_MAP,
                            'gender'
                        )
                        valid_id_type = self._normalize_choice(
                            self._get_value(row, 'validIdType', 'valid_id_type'),
                            self.VALID_ID_TYPE_MAP,
                            'valid ID type'
                        )
                        is_active = self._normalize_choice(
                            self._get_value(row, 'status'),
                            {'active': 'active', 'inactive': 'inactive'},
                            'status'
                        )
                        is_active = self.STATUS_MAP.get(is_active, True)

                        club = self._get_value(row, 'club')
                        council_church = self._get_value(row, 'councilChurch', 'church')
                        youth_council_group = self._get_value(row, 'youthCouncilGroup')

                        if unit == 'Council of Church':
                            club = council_church
                            if not club:
                                raise ValueError('councilChurch is required when unit is Council of Church')
                        elif unit == 'Youth Council':
                            club = youth_council_group
                            if not club:
                                raise ValueError('youthCouncilGroup is required when unit is Youth Council')

                        passport_file = self._fetch_remote_file(
                            self._get_value(row, 'passportUrl', 'passport_photo', 'passport'),
                            'passport'
                        ) or self._placeholder_passport_file()
                        valid_id_file = self._fetch_remote_file(
                            self._get_value(row, 'validIdDocumentUrl', 'valid_id_file', 'validIdFile', 'validIdDocument'),
                            'valid-id'
                        )
                        signature_file = self._fetch_remote_file(
                            self._get_value(row, 'signatureUrl', 'signature'),
                            'signature'
                        )

                        user = User.objects.create(
                            first_name=first_name,
                            last_name=last_name,
                            email=email,
                            membership_type=membership_type,
                            is_active=is_active,
                        )
                        user.set_password('YMCA123456789')
                        user.save()

                        user_request = UserRequest.objects.create(
                            user=user,
                            first_name=first_name,
                            last_name=last_name or first_name,
                            email=email,
                            phone_number=phone_number,
                            unit=unit,
                            club=club or '',
                            gender=gender,
                            valid_id_type=valid_id_type,
                            valid_id_number=self._get_value(row, 'validIdNumber', 'valid_id_number'),
                            passport_photo=passport_file,
                            valid_id_file=valid_id_file,
                            signature=signature_file,
                            status=RequestStatus.APPROVED,
                        )

                        user.user_request = user_request
                        if user_request.passport_photo:
                            user.image = user_request.passport_photo
                        user.save(update_fields=['user_request', 'image', 'updated_at'])

                        user_card, _ = IDCard.objects.get_or_create(user=user)
                        if user_request.signature:
                            user_card.signature = user_request.signature
                        user_card.save()

                        processed_members.append(user)

                    except IntegrityError as e:    
                        error_message =  f"Bulk upload failed, error creating user at row {row_num}"
                        raise Exception(error_message)
                    
                    except Exception as e:
                        error_info = {
                            'row': row_num,
                            'data': row,
                            'errors': str(e)
                        }
                        errors.append(error_info)
                        
                        # Store the first error encountered
                        if first_error is None:
                            first_error = error_info
                
                if errors and not processed_members:
                    if first_error:
                        error_message = f"Error at row {first_error['row']}: {first_error['errors']}"
                        raise Exception(error_message)
                    else:
                        raise Exception('All records failed to process')
            
            return success_response(
                message=f'Successfully uploaded {len(processed_members)} members' + 
                        (f' with {len(errors)} errors' if errors else ''),
            )
            
        except Exception as e:
            return bad_request_response(
                message=f'Error processing upload file: {str(e)}'
            )








class AdminAddMembersView(generics.GenericAPIView):
    """
    Your original view for adding individual members
    """
    queryset = User.objects.filter(is_admin=False).order_by('-created_at')
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        data = request.data
        data['password'] = 'YMCA123456789'
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return success_response(data={})

    def get(self, request):
        members = self.get_queryset().order_by('-created_at')
        serializer = UserSerializer(members, many=True, context={'request': request})
        return paginate_success_response(request, serializer.data, int(request.GET.get('page_size', 100)))
    




class AdminMemberRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):

    queryset = User.objects.filter(is_admin=False).order_by('-created_at')
    serializer_class = UserSerializer
    lookup_field = 'id'



    def delete(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            user.delete()
            return success_response(
                message="Member deleted successfully"
            )
        except:
            return bad_request_response(
                message='Error deleting user'
            )
        
    def patch(self, request, *args, **kwargs):
        try:
            user = self.get_object()
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Member updated successfully"
                )
        except:
            return bad_request_response(
                message='Error updating user'
            )
        


class CreateUserRequestView(generics.CreateAPIView):
    """
    Create a new user request
    """
    serializer_class = UserRequestSerializer
    permission_classes = []  # User must be logged in
    parser_classes = [MultiPartParser, FormParser]  # Handle file uploads
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            user_request = serializer.save()
            
            response_data = {
                'id': str(user_request.id),
                'first_name': user_request.first_name,
                'last_name': user_request.last_name,
                'phone_number': user_request.phone_number,
                'email': user_request.email,
                'country': user_request.country,
                'state': user_request.state,
                'unit': user_request.unit,
                'club': user_request.club,
                'status': user_request.status,
                'created_at': user_request.created_at,
            }
            
            return success_response(
                message='Request submitted successfully',
                data=response_data
            )
            
        except ValueError as e:

            print(e)
            return bad_request_response(
                message='Invalid request data'
            )
        
        except Exception as e:
            print(e)
            return internal_server_error_response(
                message= 'An error occurred while processing your request'
            )


class UserRequestListView(generics.ListAPIView):
    """
    List all requests for the authenticated user
    """
    serializer_class = UserRequestListSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserRequest.objects.filter(user=self.request.user)


class UserRequestDetailView(generics.RetrieveAPIView):
    """
    Retrieve a specific user request
    """
    serializer_class = UserRequestSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserRequest.objects.filter(user=self.request.user)




class AdminMemberUpdateDestroyView(generics.GenericAPIView):

    queryset = User.objects.filter(is_admin=False).order_by('-created_at')
    serializer_class = UserSerializer
    lookup_field = 'id'

        
    def put(self, request,id):
        try:
            user = User.objects.get(id=id)
        except:
            return bad_request_response(
                message='User not found'
                )
        try:
            serializer = self.get_serializer(user, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return success_response(
                data=serializer.data,
                message="Member updated successfully"
                )
        except:
            return bad_request_response(
                message='Error updating user'
            )
        

    
    def delete(self, request, id):
        try:
            user = User.objects.get(id=id)
        except:
            return bad_request_response(
                message='User not found'
                )
        try:
            user = self.get_object()
            user.delete()
            return success_response(
                message="Member deleted successfully"
            )
        except:
            return bad_request_response(
                message='Error deleting user'
            )
       
        

# Admin views (optional - for admin panel)
class AdminUserRequestListView(generics.ListAPIView):
    """
    List all requests for admin users
    """
    serializer_class = UserRequestListSerializer
    permission_classes = [IsAuthenticated] 
    queryset = UserRequest.objects.all()
    
    def get_queryset(self):
        # Only allow admin users to see all requests
        if not self.request.user.is_admin:
            return UserRequest.objects.none()
        return super().get_queryset()
    

    def get(self, request, *args, **kwargs):
        members = self.get_queryset()
        serializer = self.serializer_class(members, many=True, context={'request': request})
        return paginate_success_response(request, serializer.data, int(request.GET.get('page_size', 100)))





class AdminGetSingleRequestView(generics.RetrieveAPIView):
    """
    Get single request (admin only)
    """
    permission_classes = [IsAuthenticated] 
    queryset = UserRequest.objects.all()
    serializer_class = UserRequestSerializer
    
    def get(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_request = self.get_object()
        serializer = self.serializer_class(user_request, context={'request': request})
        return success_response(
            data=serializer.data,
            message='Request retrieved successfully'
        )   


class AdminUpdateRequestStatusView(generics.UpdateAPIView):
    """
    Update request status (admin only)
    """
    permission_classes = [IsAuthenticated] 
    queryset = UserRequest.objects.all()
    
    def patch(self, request, *args, **kwargs):
        if not request.user.is_admin:
            return Response({
                'success': False,
                'message': 'Permission denied'
            }, status=status.HTTP_403_FORBIDDEN)
        
        user_request = self.get_object()
        new_status = request.data.get('status')
        review_notes = request.data.get('review_notes', '')
        
        if new_status not in [choice[0] for choice in RequestStatus.choices]:
            return Response({
                'success': False,
                'message': 'Invalid status'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if status is being changed to 'approved' and create user profile
        if new_status == 'approved' and user_request.status != 'approved':
            # Check if email is unique across all users
            if user_request.email and User.objects.filter(email=user_request.email).exists():
                return Response({
                    'success': False,
                    'message': 'A user with this email already exists. Cannot approve request.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Create user profile with default password
            try:
                with transaction.atomic():
                    # Create the user with minimal essential data
                    user = User.objects.create_user(
                        email=user_request.email,
                        password='member12345',
                        first_name=user_request.first_name,
                        last_name=user_request.last_name,
                        is_admin=False,
                        is_active=True
                    )
                    
                    # Link the UserRequest to the created user
                    user.user_request = user_request
                    user.save()
                    user_request.status = new_status
                    user_request.review_notes = review_notes
                    user_request.reviewed_by = request.user
                    user_request.reviewed_at = timezone.now()
                    user_request.save() 


                    # get user ID card
                    try:
                        user_id_card, _ = IDCard.objects.get_or_create(user=user)
                        user_id_card.signature = user_request.signature
                        user_id_card.save()
                    except:pass
                    try:
                        user.image = user_request.passport_photo
                        user.save()
                    except:pass
                    
                    return success_response(
                        data={
                            'id': str(user_request.id),
                            'status': user_request.status,
                            'reviewed_by': request.user.email,
                            'reviewed_at': user_request.reviewed_at,
                            'user_created': True,
                            'user_id': str(user.id),
                            'user_email': user.email,
                        },
                        message='Request approved successfully and user profile created with default password'
                    )
                    
            except IntegrityError as e:
                return Response({
                    'success': False,
                    'message': 'Failed to create user profile. Email may already exist.'
                }, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({
                    'success': False,
                    'message': f'Error creating user profile: {str(e)}'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        # For other status changes, just update the request
        user_request.status = new_status
        user_request.review_notes = review_notes
        user_request.reviewed_by = request.user
        user_request.reviewed_at = timezone.now()
        user_request.save()
        
        return success_response(
            data={
                'id': str(user_request.id),
                'status': user_request.status,
                'reviewed_by': request.user.email,
                'reviewed_at': user_request.reviewed_at,
            },
            message='Request status updated successfully'
        )




class VerifyCardIdNumberView(generics.GenericAPIView):
    permission_classes = []

    def get(self, request, id_number):
        card = IDCard.objects.filter(id_number=id_number).first()

        # If card is not found
        if not card:
            return success_response(
                data={
                    'valid': False,
                    'error': 'Card not found or invalid verification ID',
                    'cardId': id_number
                }
            )

        # Check and update expiration status
        if card.expired_at and card.expired_at < date.today():
            if not card.expired:
                card.expired = True
                card.save(update_fields=['expired'])
        else:
            if card.expired:
                card.expired = False
                card.save(update_fields=['expired'])

        # Build response
        response_data = IDCardSerializer(card).data
        response_data['first_name'] = card.user.first_name
        response_data['last_name'] = card.user.last_name

        return success_response(
            data=dict(
                valid=True,
                data=response_data,
                verifiedAt=card.updated_at,
                expired=card.expired
            )
        )

class AdminMembersExportView(generics.GenericAPIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        users = User.objects.filter(is_admin=False).select_related('user_request')

        raw_user_ids = request.GET.get('user_ids', '').strip()
        if raw_user_ids:
            user_ids = [user_id.strip() for user_id in raw_user_ids.split(',') if user_id.strip()]
            users = users.filter(id__in=user_ids)

        users = users.order_by('-created_at')
        
        # Create workbook and worksheet
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Members"

        # Define columns
        columns = [
            'First Name', 'Last Name', 'Email', 'Phone Number', 
            'Membership Type', 'Unit', 'Club', 'Gender', 
            'State', 'Status', 'Joined Date'
        ]
        ws.append(columns)

        # Add data
        for user in users:
            # Safely get user_request data
            ur = user.user_request
            ws.append([
                user.first_name or '',
                user.last_name or '',
                user.email or '',
                ur.phone_number if ur else '',
                user.get_membership_type_display(),
                ur.unit if ur else '',
                ur.club if ur else '',
                ur.gender if ur else '',
                ur.state if ur else '',
                'Active' if user.is_active else 'Inactive',
                user.created_at.strftime('%Y-%m-%d %H:%M:%S') if user.created_at else ''
            ])

        # Prepare response
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="members_list.xlsx"'
        wb.save(response)
        return response
