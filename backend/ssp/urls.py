"""
URL configuration for ssp project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('core.urls')),
    path('api/dues/', include('dues.urls')),
    
    # # Dashboard routes
    # path('dashboard/library/', TemplateView.as_view(template_name='dashboard/library.html'), name='library_dashboard'),
    # path('dashboard/hostel/', TemplateView.as_view(template_name='dashboard/hostel.html'), name='hostel_dashboard'),
    # path('dashboard/accounts/', TemplateView.as_view(template_name='dashboard/accounts.html'), name='accounts_dashboard'),
    # path('dashboard/sports/', TemplateView.as_view(template_name='dashboard/sports.html'), name='sports_dashboard'),
    # path('dashboard/lab/', TemplateView.as_view(template_name='dashboard/lab.html'), name='lab_dashboard'),
]

if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
    ]
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
