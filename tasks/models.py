from django.db import models
from django.conf import settings

class Task(models.Model):
    STATUS_CHOICES = [
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('DONE', 'Done'),
        ]

    PRIORITY_CHOICES = [
    ('High' 'Very Important'),
    ('Medium', 'Important'),
    ('Low', 'Less Important'),
    ]
    
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='TODO')
    priority = models.CharField(choices=STATUS_CHOICES, max_length=20, default='MEDIUM')
    due_date = models.DateField(null=True, blank=True)
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta: 
        ordering = ['created_at'] 
    
    def __str__(self):
        return self.title

class Note(models.Model):
    content = models.TextField()
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notes')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Note on: {self.task.title}"
    