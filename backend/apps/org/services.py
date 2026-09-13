from django.db import transaction

from apps.accounts.models import AdminUser
from apps.org.models import OrgNode
from apps.ranger.models import Area, Ranger


@transaction.atomic
def create_org(**payload):
    return OrgNode.objects.create(**payload)


@transaction.atomic
def update_org(org, **payload):
    for key, value in payload.items():
        setattr(org, key, value)
    org.save()
    return org


def delete_org(org):
    if OrgNode.objects.children_of(org.id).exists():
        return False, '存在下级组织，无法删除'
    if Ranger.objects.in_org(org.id).exists():
        return False, '组织下存在护林员，无法删除'
    if Area.objects.filter(town_id=org.id).exists():
        return False, '组织下存在责任区域，无法删除'
    if AdminUser.objects.filter(town_id=org.id).exists():
        return False, '组织下存在管理员，无法删除'
    org.delete()
    return True, ''
