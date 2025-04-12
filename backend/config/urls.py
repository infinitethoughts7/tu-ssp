from django.contrib import admin
from django.urls import path, include

# Main URL patterns for the entire project
urlpatterns = [
    # Django admin interface
    path('admin/', admin.site.urls),

    # Core app endpoints (includes authentication and features)
    path('api/', include('core.urls')),
] 