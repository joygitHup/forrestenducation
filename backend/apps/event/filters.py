import django_filters

from apps.event.models import Event, Warning


class EventFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    type = django_filters.NumberFilter(field_name='type')
    status = django_filters.NumberFilter(field_name='status')
    townId = django_filters.NumberFilter(field_name='town_id')
    town_id = django_filters.NumberFilter(field_name='town_id')

    class Meta:
        model = Event
        fields = ('keyword', 'type', 'status', 'townId', 'town_id')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)


class WarningFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    type = django_filters.CharFilter(field_name='type')
    status = django_filters.NumberFilter(field_name='status')

    class Meta:
        model = Warning
        fields = ('keyword', 'type', 'status')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)
