import datetime
from rest_framework import serializers
from rest_framework import serializers
from rest_framework.exceptions import ValidationError
from backend import settings
from .models import IDCard, User, SystemCardSignature



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class IDCardSerializer(serializers.ModelSerializer):
    days_remaining = serializers.SerializerMethodField()
    signature = serializers.SerializerMethodField()
    class Meta:
        model = IDCard
        fields = ["id","id_number","is_active","expired","expired_at","days_remaining",'signature',"first_time"]

    def get_days_remaining(self,obj:IDCard):
        try:
            if obj.expired_at:
                return int((obj.expired_at - datetime.date.today()).days)
            return 0
        except:
            return 0
        
    def get_signature(self, obj):
        if obj.signature:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.signature.url)
            return f"{settings.BASE_URL}{obj.signature.url}"
        return None

    

class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()
    card = serializers.SerializerMethodField(read_only=True)
    image = serializers.SerializerMethodField()
    user_request = serializers.SerializerMethodField(read_only=True)
    profile_completion_required = serializers.SerializerMethodField()
    
    class Meta:
        model = User 
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'phone_number',
            'gender',
            'image',
            'card',
            'role',
            'user_request',
            'membership_type',
            'profile_completion_required',
            'password',
            'created_at',
            'is_active',
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def get_card(self, obj: User):
        request = self.context.get('request')
        id_card, created = IDCard.objects.get_or_create(user=obj)
        return IDCardSerializer(id_card, context={'request': request}).data

    def get_role(self,obj:User):
        return obj.get_role_display()

    def get_image(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"{settings.BASE_URL}{obj.image.url}"
        return None
    
    def get_user_request(self, obj: User):
        """Return user request data if available"""
        if obj.user_request:
            from api.serializers.members import UserRequestSerializer
            return UserRequestSerializer(obj.user_request).data
        return None

    def get_profile_completion_required(self, obj: User):
        if obj.is_admin or not obj.user_request:
            return False

        user_request = obj.user_request
        passport_name = getattr(user_request.passport_photo, 'name', '') or ''
        valid_id_name = getattr(user_request.valid_id_file, 'name', '') or ''
        signature_name = getattr(user_request.signature, 'name', '') or ''

        required_values = [
            user_request.phone_number,
            user_request.gender,
            user_request.date_of_birth,
            user_request.marital_status,
            user_request.citizen,
            user_request.address,
            user_request.unit,
            user_request.profession,
            user_request.occupation,
            user_request.religion,
            user_request.valid_id_type,
            valid_id_name,
            signature_name,
            user_request.next_of_kin,
            user_request.next_of_kin_phone,
        ]

        if (user_request.citizen or '').lower() == 'foreigner':
            required_values.append(user_request.country)
        else:
            required_values.append(user_request.state)

        if user_request.unit in ['Council of Church', 'Youth Council']:
            required_values.append(user_request.club)

        if (user_request.religion or '').lower() == 'christian':
            required_values.append(user_request.church_name)

        if not passport_name or 'bulk-upload-passport-' in passport_name:
            return True

        return any(not value for value in required_values)


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name'),
            last_name=validated_data.get('last_name'),
        )
        user_id_card, created = IDCard.objects.get_or_create(user=user)
        return user





class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    confirm_new_password = serializers.CharField(required=True)

    def validate(self, data):
        # Check that new passwords match
        if data['new_password'] != data['confirm_new_password']:
            raise ValidationError("New passwords do not match.")
        return data
    


class SystemCardSignatureSerializer(serializers.ModelSerializer):
    signature = serializers.SerializerMethodField()
    class Meta:
        model = SystemCardSignature
        fields = ['id', 'signature', 'is_active', 'created_at', 'updated_at']

    def get_signature(self, obj):
        if obj.signature:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.signature.url)
            return f"{settings.BASE_URL}{obj.signature.url}"
        return None
