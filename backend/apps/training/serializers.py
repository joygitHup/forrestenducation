from rest_framework import serializers

from apps.training.constants import COURSE_STATUS_TEXT, COURSE_TYPE_TEXT, CourseStatus, CourseType
from apps.training.models import Course, StudyRecord


class CourseListSerializer(serializers.ModelSerializer):
    coverUrl = serializers.CharField(source='cover_url', read_only=True)
    contentUrl = serializers.CharField(source='content_url', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    typeName = serializers.SerializerMethodField()
    statusName = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = (
            'id', 'title', 'coverUrl', 'type', 'typeName', 'contentUrl',
            'duration', 'sort', 'status', 'statusName', 'createdAt',
        )

    def get_typeName(self, obj):
        return COURSE_TYPE_TEXT.get(obj.type, '其他')

    def get_statusName(self, obj):
        return COURSE_STATUS_TEXT.get(obj.status, '未知')


class CourseDetailSerializer(CourseListSerializer):
    pass


class CourseWriteSerializer(serializers.ModelSerializer):
    coverUrl = serializers.CharField(source='cover_url', required=False, allow_blank=True, default='')
    contentUrl = serializers.CharField(source='content_url', required=False, allow_blank=True, default='')

    class Meta:
        model = Course
        fields = ('title', 'coverUrl', 'type', 'contentUrl', 'duration', 'sort', 'status')

    def to_internal_value(self, data):
        data = data.copy()
        aliases = (('cover_url', 'coverUrl'), ('content_url', 'contentUrl'))
        for snake, camel in aliases:
            if snake in data and camel not in data:
                data[camel] = data[snake]
        if data.get('duration') in ('',):
            data['duration'] = None
        if data.get('sort') in ('', None):
            data['sort'] = 0
        return super().to_internal_value(data)

    def validate_type(self, value):
        if value not in CourseType.values:
            raise serializers.ValidationError('课程类型不合法')
        return value

    def validate_status(self, value):
        if value not in CourseStatus.values:
            raise serializers.ValidationError('状态不合法')
        return value

    def validate_duration(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('时长不能为负数')
        return value


class StudyRecordListSerializer(serializers.ModelSerializer):
    rangerId = serializers.IntegerField(source='ranger_id', read_only=True)
    courseId = serializers.IntegerField(source='course_id', read_only=True)
    rangerName = serializers.CharField(source='ranger.name', default=None, allow_null=True, read_only=True)
    courseTitle = serializers.CharField(source='course.title', default=None, allow_null=True, read_only=True)
    finishTime = serializers.DateTimeField(source='finish_time', allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = StudyRecord
        fields = (
            'id', 'rangerId', 'rangerName', 'courseId', 'courseTitle',
            'progress', 'finishTime', 'createdAt',
        )
