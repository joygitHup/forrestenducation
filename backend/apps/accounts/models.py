from django.db import models
from django.db.models import Q

from apps.accounts.constants import AdminRole


class AdminUserQuerySet(models.QuerySet):
    def by_username(self, username):
        return self.filter(username=username)

    def supers(self):
        return self.filter(role=AdminRole.SUPER)

    def search(self, keyword):
        if not keyword:
            return self
        return self.filter(Q(username__icontains=keyword) | Q(name__icontains=keyword))

    def with_town(self):
        return self.select_related('town')


class AdminUser(models.Model):
    username = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=64)
    role = models.CharField(max_length=16, choices=AdminRole.choices, default=AdminRole.DISTRICT)
    town = models.ForeignKey(
        'org.OrgNode',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='admin_users',
    )

    objects = AdminUserQuerySet.as_manager()

    class Meta:
        db_table = 'admin_user'
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['town']),
        ]
