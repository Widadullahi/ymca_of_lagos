from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status, generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate

from account.models import IDCard, User, SystemCardSignature, MembershipFeeSettings
from .serializers import LoginSerializer, PasswordChangeSerializer, RegisterSerializer, UserSerializer,SystemCardSignatureSerializer, MembershipFeeSettingsSerializer
from api.utils.response.response_format import success_response, bad_request_response
from api.utils.permissions import IsAppAdmin

# 


class LoginUserView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email']
        password = serializer.validated_data['password']

        

        user = authenticate(request, username=email, password=password)


        if user is not None:
            if not user.is_active:
                return bad_request_response(
                    message="Your account has been deactivated"
                )
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = {
                "tokens":{
                    'access_token': access_token,
                    'refresh_token': str(refresh),
                },
                "user": UserSerializer(user,context={'request': request}).data
            }
            return success_response(
                data=response,
                message='User logged in successfully',
            )
        return bad_request_response(
            message='Invalid email or password',
        )




class RegisterUserView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            response = {
                "tokens":{
                    'access_token': access_token,
                    'refresh_token': str(refresh),
                },
                "user": UserSerializer(user,context={'request': request}).data
            }
            return success_response(
                message='User created successfully',
                data=response
            )
        except ValueError as e:
            return bad_request_response(
                message='Invalid request',
            )



class PasswordChangeView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PasswordChangeSerializer

    def post(self, request, *args, **kwargs):
        user = request.user
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        current_password = serializer.validated_data['current_password']
        new_password = serializer.validated_data['new_password']

        # Check if current password is correct
        if not user.check_password(current_password):
            return bad_request_response(message="Current password is incorrect.")

        # Set new password and save user
        user.set_password(new_password)
        user.save()

        return success_response(message= "Password successfully changed.")
    




class ProfileView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get(self, request):
        return success_response(
            data=UserSerializer(request.user,context={'request': request}).data,
        )
    
    def put(self, request):
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        email = request.data.get("email")
        phone_number = request.data.get("phone_number")

        user: User = request.user

        if first_name:
            user.first_name = first_name

        if last_name:
            user.last_name = last_name

        if email:
            email_exist = User.objects.filter(email=email).exclude(id=request.user.id)
            if email_exist:
                return bad_request_response(
                    message='Email already exist',
                )
            user.email = email

        if phone_number is not None:
            user.phone_number = phone_number

        user.save()

        user_request = getattr(user, 'user_request', None)
        if user_request:
            if phone_number is not None:
                user_request.phone_number = phone_number

            user_request.save()

        return success_response(
            data=UserSerializer(request.user, context={'request': request}).data,
            message="Profile updated successfully"
        )
    



class ProfileImageView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self,request):
        signature = request.data.get("picture")
        user:User = request.user
        user.image = signature
        user.save()
        return success_response(
            data=UserSerializer(request.user,context={'request': request}).data,
            message="Profile image updated successfully"
        )
    


class CardSignatureView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)
    
    def post(self,request):
        signature = request.data.get("signature")

        user:User = request.user
        card, created = IDCard.objects.get_or_create(user=user)
        card.signature = signature
        card.save()
        return success_response(
            data=UserSerializer(request.user,context={'request': request}).data,
            message="Signature updated successfully"
        )

    


class SystemCardSignatureView(generics.GenericAPIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAppAdmin()]
    
    def post(self,request):
        signature = request.data.get("signature")
        SystemCardSignature.objects.filter(is_active=True).update(is_active=False)
        card = SystemCardSignature.objects.create(signature=signature)
        card.is_active = True
        card.save()
        return success_response(
            data=SystemCardSignatureSerializer(card, context={'request': request}).data,
            message="Signature updated successfully"
        )

    def get(self,request):
        card = SystemCardSignature.objects.filter(is_active=True).first()
        return success_response(
            data=SystemCardSignatureSerializer(card, context={'request': request}).data,
        )


class MembershipFeeSettingsView(generics.GenericAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_permissions(self):
        if self.request.method in ['PUT', 'PATCH']:
            self.permission_classes = [IsAppAdmin]
        return super().get_permissions()
    
    def get(self, request):
        settings = MembershipFeeSettings.objects.filter(is_active=True).first()
        if not settings:
            # Create default settings
            settings = MembershipFeeSettings.objects.create()
        return success_response(
            data=MembershipFeeSettingsSerializer(settings, context={'request': request}).data,
        )
    
    def put(self, request):
        settings = MembershipFeeSettings.objects.filter(is_active=True).first()
        if not settings:
            settings = MembershipFeeSettings.objects.create()
        
        serializer = MembershipFeeSettingsSerializer(settings, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return success_response(
            data=serializer.data,
            message="Membership fee settings updated successfully"
        )

