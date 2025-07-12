from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Sum, Q, Count
from django.utils import timezone
from datetime import datetime
from .models import FeeStructure, AcademicRecords, HostelRecords, LibraryRecords, LegacyAcademicRecords
from .serializers import (
    FeeStructureSerializer, AcademicRecordsSerializer, HostelRecordsSerializer,
    LibraryRecordsSerializer, LegacyAcademicRecordsSerializer
)
from core.models import StudentProfile

class FeeStructureViewSet(viewsets.ModelViewSet):
    queryset = FeeStructure.objects.all()
    serializer_class = FeeStructureSerializer
    permission_classes = [IsAuthenticated]

class AcademicRecordsViewSet(viewsets.ModelViewSet):
    queryset = AcademicRecords.objects.all()
    serializer_class = AcademicRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = AcademicRecords.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

class HostelRecordsViewSet(viewsets.ModelViewSet):
    queryset = HostelRecords.objects.all()
    serializer_class = HostelRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = HostelRecords.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

class LibraryRecordsViewSet(viewsets.ModelViewSet):
    queryset = LibraryRecords.objects.all()
    serializer_class = LibraryRecordsSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = LibraryRecords.objects.all()
        student_id = self.request.query_params.get('student_id', None)
        if student_id:
            queryset = queryset.filter(student_id=student_id)
        return queryset

    @action(detail=False, methods=['get'])
    def grouped_by_student(self, request):
        """Get library records grouped by student for frontend display, including total_fine_amount"""
        try:
            queryset = self.get_queryset().select_related('student__user', 'student__course')
            grouped_data = {}
            for record in queryset:
                try:
                    student_key = record.student.user.username
                    if student_key not in grouped_data:
                        grouped_data[student_key] = {
                            'roll_numbers': [student_key],
                            'name': f"{record.student.user.first_name or ''} {record.student.user.last_name or ''}".strip() or 'Unknown',
                            'course': record.student.course.name if record.student.course else 'N/A',
                            'batch': record.student.batch or 'N/A',
                            'phone_number': record.student.mobile_number or 'N/A',
                            'records': [],
                            'total_fine_amount': 0,
                            'user': {
                                'username': record.student.user.username,
                                'first_name': record.student.user.first_name or '',
                                'last_name': record.student.user.last_name or '',
                            }
                        }
                    record_data = self.get_serializer(record).data
                    grouped_data[student_key]['records'].append(record_data)
                    grouped_data[student_key]['total_fine_amount'] += float(record.fine_amount or 0)
                except Exception as e:
                    print(f"Error processing record {record.id}: {str(e)}")
                    continue
            return Response(list(grouped_data.values()))
        except Exception as e:
            print(f"Error in grouped_by_student: {str(e)}")
            return Response({'error': 'Failed to group library records'}, status=500)

class LegacyAcademicRecordsViewSet(viewsets.ModelViewSet):
    queryset = LegacyAcademicRecords.objects.all()
    serializer_class = LegacyAcademicRecordsSerializer
    permission_classes = [IsAuthenticated]  

    def get_queryset(self):
        # Start with all records by default
        queryset = LegacyAcademicRecords.objects.all()
        
        # Filter by student username
        student_username = self.request.query_params.get('student_username', None)
        if student_username:
            queryset = queryset.filter(student__user__username__icontains=student_username)
        
        # Filter by student name
        student_name = self.request.query_params.get('student_name', None)
        if student_name:
            queryset = queryset.filter(
                Q(student__user__first_name__icontains=student_name) |
                Q(student__user__last_name__icontains=student_name)
            )
        
        # Only filter by due amount if has_dues is present in query params
        has_dues = self.request.query_params.get('has_dues', None)
        if has_dues is not None:
            if has_dues.lower() == 'true':
                queryset = queryset.filter(due_amount__gt=0)
            elif has_dues.lower() == 'false':
                queryset = queryset.filter(due_amount=0)
        # If has_dues is not present, do not filter (show all records)
        
        # Filter by TC number
        tc_number = self.request.query_params.get('tc_number', None)
        if tc_number:
            queryset = queryset.filter(tc_number__icontains=tc_number)
        
        # Filter by course
        course = self.request.query_params.get('course', None)
        if course and course != 'all':
            queryset = queryset.filter(student__course__name__icontains=course)
        
        # Filter by caste
        caste = self.request.query_params.get('caste', None)
        if caste:
            queryset = queryset.filter(student__caste__icontains=caste)
        
        # Filter by batch
        batch = self.request.query_params.get('batch', None)
        if batch:
            queryset = queryset.filter(student__batch__icontains=batch)
        
        # Filter by year (extract year from student batch)
        year = self.request.query_params.get('year', None)
        if year and year != 'all':
            queryset = queryset.filter(student__batch__icontains=str(year))
        
        # Filter by due amount range
        min_amount = self.request.query_params.get('min_amount', None)
        if min_amount:
            queryset = queryset.filter(due_amount__gte=float(min_amount))
        
        max_amount = self.request.query_params.get('max_amount', None)
        if max_amount:
            queryset = queryset.filter(due_amount__lte=float(max_amount))
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get comprehensive statistics about legacy academic records with filter support"""
        try:
            # Get the same filters as the main queryset
            queryset = self.get_queryset()
            
            # Calculate statistics based on filtered data
            total_records = queryset.count()
            records_with_dues = queryset.filter(due_amount__gt=0).count()
            records_without_dues = queryset.filter(due_amount=0).count()
            total_due_amount = queryset.aggregate(
                total=Sum('due_amount')
            )['total'] or 0
            
            tc_issued_count = queryset.filter(tc_number__isnull=False).exclude(tc_number='').count()
            
            # Year-wise statistics - using student batch year
            year_stats = []
            year_data = queryset.filter(
                student__batch__isnull=False
            ).exclude(student__batch='').values('student__batch').annotate(
                count=Count('id'),
                total_amount=Sum('due_amount')
            )
            
            # Group by year manually (extract year from batch)
            year_groups = {}
            for item in year_data:
                batch = item['student__batch']
                # Try to extract year from batch (e.g., "2020-21" -> 2020)
                try:
                    year = int(batch.split('-')[0]) if '-' in batch else int(batch[:4])
                except (ValueError, IndexError):
                    continue
                
                if year not in year_groups:
                    year_groups[year] = {'count': 0, 'total_amount': 0}
                year_groups[year]['count'] += item['count']
                year_groups[year]['total_amount'] += item['total_amount'] or 0
            
            for year, data in year_groups.items():
                year_stats.append({
                    'year': year,
                    'count': data['count'],
                    'total_amount': data['total_amount'],
                    'avg_amount': data['total_amount'] / data['count'] if data['count'] > 0 else 0
                })
            # Sort years in descending order
            year_stats.sort(key=lambda x: x['year'], reverse=True)
            
            # Course-wise statistics
            course_stats = queryset.values(
                'student__course__name'
            ).annotate(
                count=Count('id'),
                total_amount=Sum('due_amount'),
                avg_amount=Sum('due_amount') / Count('id')
            ).order_by('-total_amount')
            
            # Caste-wise statistics
            caste_stats = queryset.values(
                'student__caste'
            ).annotate(
                count=Count('id'),
                total_amount=Sum('due_amount'),
                avg_amount=Sum('due_amount') / Count('id')
            ).order_by('-total_amount')
            
            # Available years for filtering (from student batch) - descending order
            available_years = []
            batch_data = LegacyAcademicRecords.objects.filter(
                student__batch__isnull=False
            ).exclude(student__batch='').values_list('student__batch', flat=True).distinct()
            
            for batch in batch_data:
                try:
                    year = int(batch.split('-')[0]) if '-' in batch else int(batch[:4])
                    if year not in available_years:
                        available_years.append(year)
                except (ValueError, IndexError):
                    continue
            
            # Sort years in descending order
            available_years.sort(reverse=True)
            
            return Response({
                'total_records': total_records,
                'records_with_dues': records_with_dues,
                'records_without_dues': records_without_dues,
                'total_due_amount': float(total_due_amount),
                'tc_issued_count': tc_issued_count,
                'year_statistics': list(year_stats),
                'course_statistics': list(course_stats),
                'caste_statistics': list(caste_stats),
                'available_years': list(available_years),
            })
        except Exception as e:
            print(f"Error in statistics: {str(e)}")
            return Response(
                {'error': 'Failed to get statistics'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Advanced search for legacy records"""
        query = request.query_params.get('q', '')
        if not query:
            return Response(
                {'error': 'Search query is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        queryset = LegacyAcademicRecords.objects.filter(
            Q(student__user__username__icontains=query) |
            Q(student__user__first_name__icontains=query) |
            Q(student__user__last_name__icontains=query) |
            Q(tc_number__icontains=query) |
            Q(student__course__name__icontains=query) |
            Q(student__caste__icontains=query)
        )
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def grouped_by_student(self, request):
        """Get legacy records grouped by student for frontend display"""
        try:
            queryset = self.get_queryset()
            
            # Group by student
            grouped_data = {}
            for record in queryset.select_related('student__user', 'student__course'):
                try:
                    student_key = record.student.user.username
                    
                    if student_key not in grouped_data:
                        grouped_data[student_key] = {
                            'roll_numbers': [student_key],
                            'name': f"{record.student.user.first_name or ''} {record.student.user.last_name or ''}".strip() or 'Unknown',
                            'course': record.student.course.name if record.student.course else 'N/A',
                            'caste': record.student.caste or 'N/A',
                            'phone_number': record.student.mobile_number or 'N/A',
                            'dues': [],
                            'user': {
                                'username': record.student.user.username,
                                'first_name': record.student.user.first_name or '',
                                'last_name': record.student.user.last_name or '',
                            }
                        }
                    
                    # Serialize the record for JSON response - just show due_amount as is
                    record_data = {
                        'id': record.id,
                        'tc_number': record.tc_number,
                        'tc_issued_date': record.tc_issued_date.isoformat() if record.tc_issued_date else None,
                        'due_amount': record.due_amount,  # Just the raw due_amount from database
                        'student': {
                            'course_name': record.student.course.name if record.student.course else 'N/A',
                            'batch': record.student.batch or 'N/A',
                        }
                    }
                    grouped_data[student_key]['dues'].append(record_data)
                except Exception as e:
                    # Skip records with issues and continue processing
                    print(f"Error processing record {record.id}: {str(e)}")
                    continue
            
            return Response(list(grouped_data.values()))
        except Exception as e:
            print(f"Error in grouped_by_student: {str(e)}")
            return Response(
                {'error': 'Failed to group legacy records'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def paginated_grouped(self, request):
        """Get paginated and filtered legacy records grouped by student"""
        try:
            # Get pagination parameters
            page = int(request.query_params.get('page', 1))
            page_size = int(request.query_params.get('page_size', 50))
            
            # Get filtered queryset
            queryset = self.get_queryset()
            
            # Group by student - simple approach, no calculations
            grouped_data = {}
            
            for record in queryset.select_related('student__user', 'student__course'):
                try:
                    student_key = record.student.user.username
                    
                    if student_key not in grouped_data:
                        grouped_data[student_key] = {
                            'roll_numbers': [student_key],
                            'name': f"{record.student.user.first_name or ''} {record.student.user.last_name or ''}".strip() or 'Unknown',
                            'course': record.student.course.name if record.student.course else 'N/A',
                            'caste': record.student.caste or 'N/A',
                            'phone_number': record.student.mobile_number or 'N/A',
                            'dues': [],
                            'user': {
                                'username': record.student.user.username,
                                'first_name': record.student.user.first_name or '',
                                'last_name': record.student.user.last_name or '',
                            }
                        }
                    
                    # Serialize the record for JSON response - just show due_amount as is
                    record_data = {
                        'id': record.id,
                        'tc_number': record.tc_number,
                        'tc_issued_date': record.tc_issued_date.isoformat() if record.tc_issued_date else None,
                        'due_amount': record.due_amount,  # Just the raw due_amount from database
                        'student': {
                            'course_name': record.student.course.name if record.student.course else 'N/A',
                            'batch': record.student.batch or 'N/A',
                        }
                    }
                    grouped_data[student_key]['dues'].append(record_data)
                except Exception as e:
                    print(f"Error processing record {record.id}: {str(e)}")
                    continue
            
            # Convert to list
            grouped_list = list(grouped_data.values())
            
            # Apply pagination
            total_count = len(grouped_list)
            start_index = (page - 1) * page_size
            end_index = start_index + page_size
            paginated_data = grouped_list[start_index:end_index]
            
            return Response({
                'results': paginated_data,
                'count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size,
                'current_page': page,
                'page_size': page_size,
                'has_next': end_index < total_count,
                'has_previous': page > 1
            })
        except Exception as e:
            print(f"Error in paginated_grouped: {str(e)}")
            return Response(
                {'error': 'Failed to get paginated legacy records'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
