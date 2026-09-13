import django_filters

from apps.org.models import OrgNode


class OrgFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    level = django_filters.NumberFilter(field_name='level')
    parentId = django_filters.NumberFilter(field_name='parent_id')
    parent_id = django_filters.NumberFilter(field_name='parent_id')

    class Meta:
        model = OrgNode
        fields = ('keyword', 'level', 'parentId', 'parent_id')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)
