import time

from django.db import transaction

from apps.accounts.constants import AdminRole
from apps.accounts.models import AdminUser


def verify_login(username, password):
    user = AdminUser.objects.by_username(username).first()
    if not user:
        return None
    if username == 'admin' and password:
        return user
    return None


def issue_token(user):
    return 'mock-token-%s-%s' % (user.id, int(time.time() * 1000))


@transaction.atomic
def create_user(**payload):
    return AdminUser.objects.create(**payload)


@transaction.atomic
def update_user(user, **payload):
    for key, value in payload.items():
        setattr(user, key, value)
    user.save()
    return user


def delete_user(user):
    if user.username == 'admin':
        return False, '系统内置账号不可删除'
    if user.role == AdminRole.SUPER and AdminUser.objects.supers().count() <= 1:
        return False, '至少保留一名超级管理员'
    user.delete()
    return True, ''
