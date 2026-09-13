from django.db import models
from django.db.models import Q

from apps.org.constants import OrgLevel


class OrgNodeQuerySet(models.QuerySet):
    def districts(self):
        return self.filter(level=OrgLevel.DISTRICT).order_by('id')

    def towns(self):
        return self.filter(level=OrgLevel.TOWN).order_by('id')

    def villages(self, town_id=None):
        qs = self.filter(level=OrgLevel.VILLAGE)
        if town_id:
            qs = qs.filter(parent_id=town_id)
        return qs.order_by('id')

    def tree(self):
        return self.order_by('level', 'id')

    def children_of(self, org_id):
        return self.filter(parent_id=org_id)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(name__icontains=keyword))


class OrgNode(models.Model):
    name = models.CharField(max_length=64)
    parent_id = models.IntegerField(default=0)
    level = models.IntegerField(choices=OrgLevel.choices, default=OrgLevel.DISTRICT)

    objects = OrgNodeQuerySet.as_manager()

    class Meta:
        db_table = 'org_node'
        indexes = [
            models.Index(fields=['level']),
            models.Index(fields=['parent_id']),
        ]

    def __str__(self):
        return self.name
