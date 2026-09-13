from rest_framework import mixins, viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.response import fail, ok
from apps.training.filters import CourseFilter, StudyRecordFilter
from apps.training.models import Course, StudyRecord
from apps.training.serializers import (
    CourseDetailSerializer,
    CourseListSerializer,
    CourseWriteSerializer,
    StudyRecordListSerializer,
)
from apps.training.services import create_course, delete_course, get_study_stats, update_course


class CourseViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    filterset_class = CourseFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('sort', 'id', 'created_at', 'status')
    ordering = ('sort', 'id')
    pagination_class = None

    def get_queryset(self):
        return Course.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return CourseListSerializer
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseWriteSerializer

    def list(self, request, *args, **kwargs):
        return ok(self.get_serializer(self.filter_queryset(self.get_queryset()), many=True).data)

    def retrieve(self, request, *args, **kwargs):
        return ok(CourseDetailSerializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        course = create_course(**serializer.validated_data)
        return ok(CourseListSerializer(course).data, status=201)

    def update(self, request, *args, **kwargs):
        serializer = self.get_serializer(self.get_object(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        course = update_course(self.get_object(), **serializer.validated_data)
        return ok(CourseListSerializer(course).data)

    def destroy(self, request, *args, **kwargs):
        if not delete_course(self.get_object()):
            return fail('课程已被学习记录引用，无法删除', 400)
        return ok(True)


class StudyViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    filterset_class = StudyRecordFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('created_at', 'progress', 'finish_time')
    ordering = ('-created_at',)
    pagination_class = None

    def get_queryset(self):
        return StudyRecord.objects.select_related('ranger', 'course')

    def list(self, request, *args, **kwargs):
        records = self.filter_queryset(self.get_queryset())
        return ok({
            'records': StudyRecordListSerializer(records, many=True).data,
            'stats': get_study_stats(),
        })
