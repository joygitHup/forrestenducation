from django.db import models


class ExternalSystemQuerySet(models.QuerySet):
    def by_slug(self, slug):
        return self.filter(slug=slug)

    def ordered(self):
        return self.order_by('id')


class ExternalSystem(models.Model):
    slug = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=128)
    category = models.CharField(max_length=32, default='city')
    priority = models.CharField(max_length=8, default='p2')
    base_url = models.CharField(max_length=255, blank=True, default='')
    auth_type = models.CharField(max_length=16, default='none')
    enabled = models.BooleanField(default=False)
    direction = models.CharField(max_length=16, default='bidirectional')
    desc = models.TextField(blank=True, default='')
    endpoints = models.JSONField(default=list, blank=True)

    objects = ExternalSystemQuerySet.as_manager()

    class Meta:
        db_table = 'external_system'
