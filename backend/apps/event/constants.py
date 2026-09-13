from django.db import models


class EventType(models.IntegerChoices):
    FIRE = 1, '火情'
    HAZARD = 2, '隐患'
    DAMAGE = 3, '破坏森林资源'
    OTHER = 4, '其他'


class EventStatus(models.IntegerChoices):
    PENDING = 0, '待处理'
    PROCESSING = 1, '处理中'
    CLOSED = 2, '已闭环'
    REJECTED = 3, '已驳回'


class WarningType(models.TextChoices):
    NO_PATROL = 'no-patrol', '连续未巡护'
    ABNORMAL_TRACK = 'abnormal-track', '轨迹异常'
    AREA_NOT_COVERED = 'area-not-covered', '重点区域未覆盖'
    EVENT_TIMEOUT = 'event-timeout', '事件超时未处理'


class WarningLevel(models.TextChoices):
    HIGH = 'high', '高'
    MEDIUM = 'medium', '中'
    LOW = 'low', '低'


class WarningStatus(models.IntegerChoices):
    PENDING = 0, '未处理'
    RESOLVED = 1, '已处置'


EVENT_TYPE_TEXT = dict(EventType.choices)
EVENT_STATUS_TEXT = dict(EventStatus.choices)
WARNING_TYPE_TEXT = dict(WarningType.choices)
WARNING_LEVEL_TEXT = dict(WarningLevel.choices)
WARNING_STATUS_TEXT = dict(WarningStatus.choices)


class ScoreLevel:
    EXCELLENT = '优秀'
    GOOD = '良好'
    PASS = '合格'
    FAIL = '不合格'


def score_level(score):
    if score >= 85:
        return ScoreLevel.EXCELLENT
    if score >= 70:
        return ScoreLevel.GOOD
    if score >= 60:
        return ScoreLevel.PASS
    return ScoreLevel.FAIL
