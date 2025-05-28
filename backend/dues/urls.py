from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DuesViewSet, FeeStructureViewSet, AcademicDuesViewSet

router = DefaultRouter()
router.register(r'dues', DuesViewSet, basename='dues')
router.register(r'fee-structure', FeeStructureViewSet, basename='fee-structure')
router.register(r'academic-dues', AcademicDuesViewSet, basename='academic-dues')

urlpatterns = [
    path('', include(router.urls)),
] 