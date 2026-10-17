from django.contrib.auth import authenticate, password_validation
from rest_framework import serializers

from .user import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id", "username", "email", "first_name", "last_name",
            "phone_number", "address", "is_staff",
        )
        read_only_fields = ("id", "username", "is_staff")

    def validate_email(self, value):
        value = User.objects.normalize_email(value).lower()
        qs = User.objects.filter(email__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class RegisterSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, style={"input_type": "password"})

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("password",)
        read_only_fields = ("id", "is_staff")

    def validate(self, attrs):
        password_validation.validate_password(attrs["password"], User(**{
            k: v for k, v in attrs.items() if k != "password"
        }))
        return attrs

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


class LoginSerializer(serializers.Serializer):
    login = serializers.CharField(help_text="Username or email")
    password = serializers.CharField(style={"input_type": "password"})

    def validate(self, attrs):
        login = attrs["login"].strip()
        username = login
        if "@" in login:
            user = User.objects.filter(email__iexact=login).only("username").first()
            username = user.username if user else None
        user = username and authenticate(
            self.context["request"], username=username, password=attrs["password"]
        )
        if not user:
            raise serializers.ValidationError("Invalid credentials.", code="authorization")
        attrs["user"] = user
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(style={"input_type": "password"})
    new_password = serializers.CharField(style={"input_type": "password"})

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate_new_password(self, value):
        password_validation.validate_password(value, self.context["request"].user)
        return value
