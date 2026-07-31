from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.http import JsonResponse
from tasks.views import frontend_page, dashboard_page

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', frontend_page, name='login'),
    path('dashboard/', dashboard_page, name='dashboard'),
    
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/', include('accounts.urls')),

     path('api/accounts/', include('accounts.urls')),
  
]
