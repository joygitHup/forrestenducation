from django.db import models


class OrgLevel(models.IntegerChoices):
    DISTRICT = 1, '区'
    TOWN = 2, '乡镇'
    VILLAGE = 3, '村'


ORG_LEVEL_TEXT = dict(OrgLevel.choices)
