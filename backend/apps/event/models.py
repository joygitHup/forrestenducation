from datetime import timedelta

from django.conf import settings
from django.db import models
from django.utils import timezone

from django.db.models import Q

from apps.event.constants import EventStatus, EventType, WarningStatus


class EventQuerySet(models.QuerySet):
    def by_status(self, status):
        return self.filter(status=int(status)) if status not in (None, '') else self

    def by_type(self, event_type):
        return self.filter(type=int(event_type)) if event_type not in (None, '') else self

    def by_town(self, town_id):
        return self.filter(town_id=town_id) if town_id else self

    def pending(self):
        return self.filter(status=EventStatus.PENDING)

    def closed(self):
        return self.filter(status=EventStatus.CLOSED)

    def for_ranger(self, ranger_id):
        return self.filter(ranger_id=ranger_id)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(
            Q(description__icontains=keyword)
            | Q(address__icontains=keyword)
            | Q(ranger_name__icontains=keyword)
            | Q(ranger__name__icontains=keyword)
            | Q(town__name__icontains=keyword)
        )

    def timeout_pending(self):
        hours = getattr(settings, 'EVENT_TIMEOUT_HOURS', 2)
        cutoff = timezone.now() - timedelta(hours=hours)
        return self.pending().filter(created_at__lt=cutoff)

    def newest_first(self):
        return self.order_by('-created_at')


class Event(models.Model):
    ranger = models.ForeignKey(
        'ranger.Ranger',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='events',
    )
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    town = models.ForeignKey('org.OrgNode', null=True, blank=True, on_delete=models.SET_NULL)
    type = models.IntegerField(choices=EventType.choices, default=EventType.OTHER)
    description = models.TextField(blank=True, default='')
    images = models.JSONField(default=list, blank=True)
    lng = models.FloatField(null=True, blank=True)
    lat = models.FloatField(null=True, blank=True)
    address = models.CharField(max_length=255, blank=True, default='')
    status = models.IntegerField(choices=EventStatus.choices, default=EventStatus.PENDING)
    handler_id = models.IntegerField(null=True, blank=True)
    handler_name = models.CharField(max_length=64, blank=True, default='')
    handle_note = models.TextField(blank=True, default='')
    handle_time = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    objects = EventQuerySet.as_manager()

    class Meta:
        db_table = 'event'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['type']),
            models.Index(fields=['town']),
            models.Index(fields=['created_at']),
        ]


class WarningQuerySet(models.QuerySet):
    def by_type(self, warning_type):
        return self.filter(type=warning_type) if warning_type else self

    def by_status(self, status):
        return self.filter(status=int(status)) if status not in (None, '') else self

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(
            Q(title__icontains=keyword)
            | Q(detail__icontains=keyword)
            | Q(ranger_name__icontains=keyword)
            | Q(town_name__icontains=keyword)
        )

    def unhandled_first(self):
        return self.order_by('status', '-created_at')

    def for_dashboard(self):
        limit = getattr(settings, 'DASHBOARD_WARNING_LIMIT', 5)
        return self.unhandled_first()[:limit]


class Warning(models.Model):
    type = models.CharField(max_length=32)
    title = models.CharField(max_length=128)
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    town_name = models.CharField(max_length=64, blank=True, default='')
    detail = models.TextField(blank=True, default='')
    level = models.CharField(max_length=16, default='medium')
    status = models.IntegerField(choices=WarningStatus.choices, default=WarningStatus.PENDING)
    created_at = models.DateTimeField(default=timezone.now)

    objects = WarningQuerySet.as_manager()

    class Meta:
        db_table = 'warning'
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['status']),
            models.Index(fields=['level']),
        ]
