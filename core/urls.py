from django.contrib import admin
from django.urls import path, include
from tasks.views import frontend_page, dashboard_page
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', frontend_page, name='login'),
    path('dashboard/', dashboard_page, name='dashboard'),
    
    path('api/tasks/', include('tasks.urls')),
    path('api/auth/', include('accounts.urls')),

     path('api/accounts/', include('accounts.urls')),
  
]

# Serve static files in production
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
