from django.db import transaction

from apps.ranger.models import Ranger
from apps.training.models import Course, StudyRecord


@transaction.atomic
def create_course(**payload):
    return Course.objects.create(**payload)


@transaction.atomic
def update_course(course, **payload):
    for key, value in payload.items():
        setattr(course, key, value)
    course.save()
    return course


def delete_course(course):
    if course.study_records.exists():
        return False
    course.delete()
    return True


def get_study_stats():
    finished = StudyRecord.objects.finished().count()
    total_units = StudyRecord.objects.count()
    return {
        'totalCourses': Course.objects.published().count(),
        'totalStudyUnits': total_units,
        'finishedUnits': finished,
        'completionRate': round(finished / total_units * 1000) / 10 if total_units else 0,
        'totalRangers': Ranger.objects.active().count(),
    }
