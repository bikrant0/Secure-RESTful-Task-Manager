from rest_framework import serializers
from .models import Task, Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id','content', 'created_at']
        
class TaskSerializer(serializers.ModelSerializer):
    notes = NoteSerializer(many=True, read_only=True)
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'status', 'user', 'notes','created_at']
        
        read_only_fields=['user']
        
        
