import django_filters

from apps.training.models import Course, StudyRecord


class CourseFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    type = django_filters.NumberFilter(field_name='type')
    status = django_filters.NumberFilter(field_name='status')

    class Meta:
        model = Course
        fields = ('keyword', 'type', 'status')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)


class StudyRecordFilter(django_filters.FilterSet):
    keyword = django_filters.CharFilter(method='filter_keyword')
    courseId = django_filters.NumberFilter(field_name='course_id')
    course_id = django_filters.NumberFilter(field_name='course_id')
    rangerId = django_filters.NumberFilter(field_name='ranger_id')
    ranger_id = django_filters.NumberFilter(field_name='ranger_id')
    finished = django_filters.CharFilter(method='filter_finished')

    class Meta:
        model = StudyRecord
        fields = ('keyword', 'courseId', 'course_id', 'rangerId', 'ranger_id', 'finished')

    def filter_keyword(self, queryset, name, value):
        return queryset.search(value)

    def filter_finished(self, queryset, name, value):
        if value in (None, ''):
            return queryset
        if str(value) == '1':
            return queryset.finished()
        if str(value) == '0':
            return queryset.in_progress()
        return queryset
