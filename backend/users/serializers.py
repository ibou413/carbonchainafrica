from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserProfile
from rest_framework_simplejwt.tokens import RefreshToken, TokenError



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            raise serializers.ValidationError("L'e-mail et le mot de passe sont requis.", code='authorization')

        try:
            # We must fetch the user by email to get their actual username
            user_obj = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("Impossible de se connecter avec les informations d'identification fournies.", code='authorization')

        # Then, we authenticate using the username found.
        user = authenticate(username=user_obj.username, password=password)

        if not user:
            raise serializers.ValidationError("Impossible de se connecter avec les informations d'identification fournies.", code='authorization')
        
        if not user.is_active:
            raise serializers.ValidationError("Le compte utilisateur est désactivé.", code='authorization')

        data['user'] = user
        return data



class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role', 'hedera_account_id')

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile')

class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.Role.choices, write_only=True)

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet e-mail existe déjà.")
        return value

    def create(self, validated_data):
        role = validated_data.pop('role')

        # Create the Django User
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create the UserProfile
        UserProfile.objects.create(
            user=user, 
            role=role
        )
        return user



class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()

    default_error_messages = {
        'bad_token': 'Le token est expiré ou invalide'
    }

    def validate(self, attrs):
        self.token = attrs['refresh']
        return attrs

    def save(self, **kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            self.fail('bad_token')

