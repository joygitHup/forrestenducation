from django.db import models
from django.db.models import Q
from django.utils import timezone

from apps.training.constants import CourseStatus, CourseType


class CourseQuerySet(models.QuerySet):
    def by_status(self, status):
        return self.filter(status=int(status)) if status not in (None, '') else self

    def by_type(self, course_type):
        return self.filter(type=int(course_type)) if course_type not in (None, '') else self

    def published(self):
        return self.filter(status=CourseStatus.ON)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(title__icontains=keyword) | Q(content_url__icontains=keyword))

    def ordered(self):
        return self.order_by('sort', 'id')


class Course(models.Model):
    title = models.CharField(max_length=128)
    cover_url = models.CharField(max_length=255, blank=True, default='')
    type = models.IntegerField(choices=CourseType.choices, default=CourseType.VIDEO)
    content_url = models.CharField(max_length=255, blank=True, default='')
    duration = models.IntegerField(null=True, blank=True)
    sort = models.IntegerField(default=0)
    status = models.IntegerField(choices=CourseStatus.choices, default=CourseStatus.ON)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = CourseQuerySet.as_manager()

    class Meta:
        db_table = 'course'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['sort']),
        ]


class StudyRecordQuerySet(models.QuerySet):
    def by_course(self, course_id):
        return self.filter(course_id=course_id) if course_id else self

    def by_ranger(self, ranger_id):
        return self.filter(ranger_id=ranger_id) if ranger_id else self

    def finished(self):
        return self.filter(progress__gte=100)

    def in_progress(self):
        return self.filter(progress__lt=100)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(
            Q(ranger__name__icontains=keyword)
            | Q(course__title__icontains=keyword)
            | Q(ranger_name__icontains=keyword)
            | Q(course_title__icontains=keyword)
        )

    def newest_first(self):
        return self.order_by('-created_at')


class StudyRecord(models.Model):
    ranger = models.ForeignKey('ranger.Ranger', on_delete=models.CASCADE, related_name='study_records')
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_records')
    course_title = models.CharField(max_length=128, blank=True, default='')
    progress = models.IntegerField(default=0)
    finish_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = StudyRecordQuerySet.as_manager()

    class Meta:
        db_table = 'study_record'
        indexes = [
            models.Index(fields=['course']),
            models.Index(fields=['ranger']),
            models.Index(fields=['progress']),
        ]
