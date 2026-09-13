import django_filters

from apps.accounts.models import AdminUser


class AdminUserFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    role = django_filters.CharFilter(field_name='role')
    townId = django_filters.NumberFilter(field_name='town_id')
    town_id = django_filters.NumberFilter(field_name='town_id')

    class Meta:
        model = AdminUser
        fields = ('keyword', 'role', 'townId', 'town_id')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)
