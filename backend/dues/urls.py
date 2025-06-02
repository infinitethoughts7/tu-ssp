from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FeeStructureViewSet, AcademicViewSet,  HostelDuesViewSet, ChallanViewSet

router = DefaultRouter()
router.register(r'fee-structure', FeeStructureViewSet, basename='fee-structure')
router.register(r'academic-dues', AcademicViewSet, basename='academic-dues')
router.register(r'hostel-dues', HostelDuesViewSet, basename='hostel-dues')
router.register(r'challans', ChallanViewSet, basename='challan')

urlpatterns = [
    path('', include(router.urls)),
] 