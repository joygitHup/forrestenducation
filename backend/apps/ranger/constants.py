from django.db import models


class RangerStatus(models.IntegerChoices):
    LEFT = 0, '离职'
    ACTIVE = 1, '在岗'


RANGER_STATUS_TEXT = dict(RangerStatus.choices)
