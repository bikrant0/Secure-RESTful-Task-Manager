from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'userfirst_name', 'email','password']
        
        extra_kwargs = {
            'password' : {'write_only': True},
            'email' : {'required': True},
        }
        
    def create(self, validated_data):
        return User.objects.create_user(
            email = validated_data['email'],
            password = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
        )