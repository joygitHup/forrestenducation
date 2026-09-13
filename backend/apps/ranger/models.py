from django.db import models
from django.db.models import Q

from apps.ranger.constants import RangerStatus


class AreaQuerySet(models.QuerySet):
    def with_town(self):
        return self.select_related('town')

    def with_assigned_rangers(self):
        from apps.ranger.models import Ranger

        return self.prefetch_related(
            models.Prefetch('rangers', queryset=Ranger.objects.active(), to_attr='active_rangers')
        )

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(name__icontains=keyword) | Q(town__name__icontains=keyword))

    def by_town(self, town_id):
        return self.filter(town_id=town_id) if town_id else self


class Area(models.Model):
    name = models.CharField(max_length=128)
    town = models.ForeignKey('org.OrgNode', on_delete=models.PROTECT, related_name='areas')
    boundary = models.JSONField(default=list, blank=True)
    area_size = models.FloatField(null=True, blank=True)
    key_points = models.JSONField(default=list, blank=True)
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)

    objects = AreaQuerySet.as_manager()

    class Meta:
        db_table = 'area'
        indexes = [
            models.Index(fields=['town']),
        ]


class RangerQuerySet(models.QuerySet):
    def active(self):
        return self.filter(status=RangerStatus.ACTIVE)

    def online_active(self):
        return self.filter(status=RangerStatus.ACTIVE, online=True)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(name__icontains=keyword) | Q(phone__icontains=keyword) | Q(id_card__icontains=keyword))

    def by_town(self, town_id):
        return self.filter(town_id=town_id) if town_id else self

    def by_status(self, status):
        if status in (None, ''):
            return self
        return self.filter(status=int(status))

    def with_relations(self):
        return self.select_related('town', 'village', 'area')

    def in_org(self, org_id):
        return self.filter(Q(town_id=org_id) | Q(village_id=org_id))

    def assigned_to_area(self, area_id):
        return self.filter(area_id=area_id)

    def by_phone(self, phone):
        return self.filter(phone=phone)


class Ranger(models.Model):
    name = models.CharField(max_length=64)
    phone = models.CharField(max_length=20, unique=True)
    id_card = models.CharField(max_length=32, blank=True, default='')
    town = models.ForeignKey('org.OrgNode', on_delete=models.PROTECT, related_name='rangers')
    village = models.ForeignKey(
        'org.OrgNode',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='village_rangers',
    )
    area = models.ForeignKey(Area, null=True, blank=True, on_delete=models.SET_NULL, related_name='rangers')
    avatar_url = models.CharField(max_length=255, blank=True, default='')
    status = models.IntegerField(choices=RangerStatus.choices, default=RangerStatus.ACTIVE)
    hire_date = models.DateField(null=True, blank=True)
    online = models.BooleanField(default=False)
    month_distance = models.FloatField(default=0)
    month_checkin_rate = models.FloatField(default=0)
    score = models.FloatField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = RangerQuerySet.as_manager()

    class Meta:
        db_table = 'ranger'
        indexes = [
            models.Index(fields=['status']),
            models.Index(fields=['town']),
            models.Index(fields=['online']),
        ]


class PatrolQuerySet(models.QuerySet):
    def completed(self):
        return self.filter(status=1)

    def for_ranger(self, ranger_id):
        return self.filter(ranger_id=ranger_id).order_by('-start_time')

    def started_on(self, day):
        return self.filter(start_time__date=day)


class Patrol(models.Model):
    ranger = models.ForeignKey(Ranger, on_delete=models.CASCADE, related_name='patrols')
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    town = models.ForeignKey('org.OrgNode', null=True, blank=True, on_delete=models.SET_NULL)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    distance = models.FloatField(default=0)
    duration = models.IntegerField(default=0)
    track = models.JSONField(default=list, blank=True)
    key_points_hit = models.JSONField(default=list, blank=True)
    status = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = PatrolQuerySet.as_manager()

    class Meta:
        db_table = 'patrol'
