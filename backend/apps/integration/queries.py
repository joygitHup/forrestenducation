from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone

from apps.event.constants import EVENT_TYPE_TEXT
from apps.event.models import Event, Warning
from apps.ranger.models import Patrol, Ranger


def get_dashboard():
    today = timezone.localdate()
    active = Ranger.objects.active()
    today_patrols = Patrol.objects.completed().started_on(today)
    ranger_total = active.count()
    covered = today_patrols.values_list('ranger_id', flat=True).distinct().count()
    today_distance = today_patrols.aggregate(total=Sum('distance'))['total'] or 0
    checkin_avg = 0
    if ranger_total:
        checkin_avg = round(sum(r.month_checkin_rate or 0 for r in active) / ranger_total * 100) / 100

    weekly = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_qs = Patrol.objects.started_on(day)
        weekly.append({
            'date': '%s/%s' % (day.month, day.day),
            'patrol_count': day_qs.count(),
            'distance': round((day_qs.aggregate(total=Sum('distance'))['total'] or 0) * 10) / 10,
        })

    type_count = {}
    for event in Event.objects.all():
        type_count[event.type] = type_count.get(event.type, 0) + 1
    event_type_stats = [
        {'type': event_type, 'type_name': EVENT_TYPE_TEXT.get(event_type, '其他'), 'count': count}
        for event_type, count in type_count.items()
    ]
    return {
        'stats': {
            'ranger_total': ranger_total,
            'online_count': Ranger.objects.online_active().count(),
            'today_patrol_rate': round(covered / ranger_total * 100) / 100 if ranger_total else 0,
            'pending_events': Event.objects.pending().count(),
            'today_distance': round(today_distance * 10) / 10,
            'checkin_avg_rate': checkin_avg,
            'weekly_trend': weekly,
            'event_type_stats': event_type_stats,
        },
        'warnings': Warning.objects.for_dashboard(),
    }
