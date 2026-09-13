from django.db import models


class CourseType(models.IntegerChoices):
    VIDEO = 1, '视频'
    ARTICLE = 2, '图文'


class CourseStatus(models.IntegerChoices):
    OFF = 0, '下架'
    ON = 1, '上架'


COURSE_TYPE_TEXT = dict(CourseType.choices)
COURSE_STATUS_TEXT = dict(CourseStatus.choices)
