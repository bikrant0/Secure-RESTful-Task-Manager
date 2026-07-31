from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework.response import Response
from .serializers import RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer


class UserListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return User.objects.exclude(id=self.request.user.id)

    def list(self,request, *args, **kwargs):
        queryset = self.get_queryset()

        data = [{"id":user.id,
                 "email": user.email,
                 "role": user.role if hasattr(user, 'role') else 'JUNIOR'
                 } for user in queryset]
        return Response(data)
