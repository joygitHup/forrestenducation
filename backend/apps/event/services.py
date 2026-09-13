from django.db import transaction
from django.db.models import Count
from django.utils import timezone

from apps.event.constants import EVENT_STATUS_TEXT, EVENT_TYPE_TEXT
from apps.event.models import Event, Warning
from apps.ranger.models import Ranger


@transaction.atomic
def create_event(**payload):
    ranger = payload.get('ranger')
    if ranger and not payload.get('ranger_name'):
        payload['ranger_name'] = ranger.name
    if ranger and not payload.get('town'):
        payload['town'] = ranger.town
    payload.setdefault('status', 0)
    return Event.objects.create(**payload)


@transaction.atomic
def handle_event(event, status, note='', handler_name=''):
    event.status = status
    if note:
        event.handle_note = note
    if handler_name:
        event.handler_name = handler_name
    event.handle_time = timezone.now()
    event.save(update_fields=['status', 'handle_note', 'handler_name', 'handle_time'])
    return event


@transaction.atomic
def set_warning_status(warning, status):
    warning.status = 1 if int(status) == 1 else 0
    warning.save(update_fields=['status'])
    return warning


def resolve_ranger(ranger_id):
    if not ranger_id:
        return None
    return Ranger.objects.filter(pk=ranger_id).first()


def get_event_stats():
    by_status = {name: 0 for name in EVENT_STATUS_TEXT.values()}
    for row in Event.objects.values('status').annotate(total=Count('id')):
        name = EVENT_STATUS_TEXT.get(row['status'], '未知')
        by_status[name] = by_status.get(name, 0) + row['total']
    by_type = {name: 0 for name in EVENT_TYPE_TEXT.values()}
    for row in Event.objects.values('type').annotate(total=Count('id')):
        name = EVENT_TYPE_TEXT.get(row['type'], '其他')
        by_type[name] = by_type.get(name, 0) + row['total']
    return {
        'byStatus': by_status,
        'byType': by_type,
        'total': Event.objects.count(),
        'timeoutEvents': Event.objects.timeout_pending().count(),
    }
