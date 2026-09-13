import django_filters

from apps.ranger.models import Area, Ranger


class AreaFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    townId = django_filters.NumberFilter(field_name='town_id')
    town_id = django_filters.NumberFilter(field_name='town_id')

    class Meta:
        model = Area
        fields = ('keyword', 'townId', 'town_id')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)


class RangerFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    townId = django_filters.NumberFilter(field_name='town_id')
    town_id = django_filters.NumberFilter(field_name='town_id')
    status = django_filters.NumberFilter(field_name='status')

    class Meta:
        model = Ranger
        fields = ('keyword', 'townId', 'town_id', 'status')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)
