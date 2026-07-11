from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        
        extra_kwargs = {
            'password' : {'write_only': True}
        }
        
    def create(self, validated_data):
        user = User(
            username = validated_data['username']
        )
        
        user.set_password(validated_data['password'])
        user.save()
        return user