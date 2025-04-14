from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DuesViewSet

router = DefaultRouter()
router.register(r'', DuesViewSet, basename='dues')

urlpatterns = [
    path('', include(router.urls)),
] 