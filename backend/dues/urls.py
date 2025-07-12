from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FeeStructureViewSet, AcademicRecordsViewSet, HostelRecordsViewSet,
    LibraryRecordsViewSet, LegacyAcademicRecordsViewSet
)

router = DefaultRouter()
router.register(r'fee-structures', FeeStructureViewSet)
router.register(r'academic-records', AcademicRecordsViewSet, basename='academic-records')
router.register(r'hostel-records', HostelRecordsViewSet, basename='hostel-records')
router.register(r'library-records', LibraryRecordsViewSet, basename='library-records')
router.register(r'legacy-academic-records', LegacyAcademicRecordsViewSet, basename='legacy-academic-records')

urlpatterns = [
    path('', include(router.urls)),
] 