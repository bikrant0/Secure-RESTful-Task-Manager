from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from tasks.views import serve_frontend

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', serve_frontend, name='frontend'),
    
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
