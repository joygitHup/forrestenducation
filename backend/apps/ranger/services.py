from django.db import transaction

from apps.ranger.models import Area, Ranger


@transaction.atomic
def create_ranger(**payload):
    return Ranger.objects.create(**payload)


@transaction.atomic
def update_ranger(ranger, **payload):
    for key, value in payload.items():
        setattr(ranger, key, value)
    ranger.save()
    return ranger


def delete_ranger(ranger):
    ranger.delete()


@transaction.atomic
def create_area(**payload):
    return Area.objects.create(**payload)


@transaction.atomic
def update_area(area, **payload):
    for key, value in payload.items():
        setattr(area, key, value)
    area.save()
    return area


def delete_area(area):
    if Ranger.objects.assigned_to_area(area.id).exists():
        return False
    area.delete()
    return True
