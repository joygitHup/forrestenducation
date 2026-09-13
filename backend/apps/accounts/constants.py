from django.db import models


class AdminRole(models.TextChoices):
    SUPER = 'super', '超级管理员'
    DISTRICT = 'district', '区级管理员'
    TOWN = 'town', '乡镇管理员'


ADMIN_ROLE_TEXT = dict(AdminRole.choices)
