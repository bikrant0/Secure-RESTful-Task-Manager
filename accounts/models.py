from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import CustomUserManager

class CustomUser(AbstractUser):
    username=None
    email = models.EmailField(unique=True)

    ROLE_CHOICES = (
        ('SENIOR', 'Senior Developer'),
        ('JUNIOR', 'Junior Developer'),
    )
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='JUNIOR')
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []
    
    objects = CustomUserManager()



    def __str__(self):
        return self.email