from django.db import models
from django.db.models import Q


class AssessmentRuleQuerySet(models.QuerySet):
    def newest_first(self):
        return self.order_by('-created_at', '-id')


class AssessmentRule(models.Model):
    name = models.CharField(max_length=128)
    patrol_weight = models.IntegerField(default=40)
    event_weight = models.IntegerField(default=30)
    study_weight = models.IntegerField(default=30)
    patrol_target = models.FloatField(null=True, blank=True)
    checkin_target = models.IntegerField(null=True, blank=True)
    effective_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = AssessmentRuleQuerySet.as_manager()

    class Meta:
        db_table = 'assessment_rule'


class AssessmentResultQuerySet(models.QuerySet):
    def for_period(self, year, month):
        return self.filter(year=year, month=month)

    def by_town(self, town_id):
        return self.filter(town_id=town_id) if town_id else self

    def for_ranger_period(self, ranger_id, year, month):
        return self.filter(ranger_id=ranger_id, year=year, month=month)

    def with_town(self):
        return self.select_related('town', 'ranger')

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(ranger_name__icontains=keyword) | Q(ranger__name__icontains=keyword))

    def ranked(self):
        return self.order_by('-total_score', 'id')


class AssessmentResult(models.Model):
    ranger = models.ForeignKey('ranger.Ranger', on_delete=models.CASCADE, related_name='assessments')
    ranger_name = models.CharField(max_length=64, blank=True, default='')
    town = models.ForeignKey('org.OrgNode', null=True, blank=True, on_delete=models.SET_NULL)
    year = models.IntegerField()
    month = models.IntegerField()
    patrol_score = models.FloatField(default=0)
    event_score = models.FloatField(default=0)
    study_score = models.FloatField(default=0)
    total_score = models.FloatField(default=0)
    rank_in_town = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = AssessmentResultQuerySet.as_manager()

    class Meta:
        db_table = 'assessment_result'
        unique_together = ('ranger', 'year', 'month')
        indexes = [
            models.Index(fields=['year', 'month']),
            models.Index(fields=['town']),
        ]
