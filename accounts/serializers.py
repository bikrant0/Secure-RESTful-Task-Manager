from django.contrib.auth import get_user_model
from rest_framework import serializers
from tasks.models import Task, Note

User = get_user_model()

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at', 'updated_at']

class TaskSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'status', 'priority', 
            'due_date', 'user', 'assignee', 'notes', 
            'created_at', 'updated_at'
        ]

        read_only_fields = ['id', 'created_at', 'user']

class RegisterSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source = 'first_name', required = False)
    class Meta:
        model = User
        fields = ['id','name', 'email','password', 'role']
        
        extra_kwargs = {
            'password' : {'write_only': True},
            'email' : {'required': True},
            'role': {'required':False}
        }
        
    def create(self, validated_data):
        return User.objects.create_user(
            email = validated_data['email'],
            password = validated_data['password'],
            first_name = validated_data.get('first_name', ''),
            role = validated_data('role', 'User'),
        )