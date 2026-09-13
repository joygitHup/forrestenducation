import django_filters

from apps.assessment.models import AssessmentResult


class AssessmentResultFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    year = django_filters.NumberFilter(field_name='year')
    month = django_filters.NumberFilter(field_name='month')
    townId = django_filters.NumberFilter(field_name='town_id')
    town_id = django_filters.NumberFilter(field_name='town_id')

    class Meta:
        model = AssessmentResult
        fields = ('keyword', 'year', 'month', 'townId', 'town_id')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)
