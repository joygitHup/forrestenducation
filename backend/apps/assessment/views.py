from rest_framework import mixins, viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.assessment.filters import AssessmentResultFilter
from apps.assessment.models import AssessmentResult, AssessmentRule
from apps.assessment.serializers import (
    AssessmentRecomputeSerializer,
    AssessmentResultListSerializer,
    AssessmentRuleListSerializer,
    AssessmentRuleWriteSerializer,
)
from apps.assessment.services import current_period, recompute_assessments, save_rule
from apps.common.query import qp_int
from apps.common.response import ok


class AssessmentViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    http_method_names = ['get', 'post', 'head', 'options']
    filterset_class = AssessmentResultFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('total_score', 'patrol_score', 'rank_in_town', 'id')
    ordering = ('-total_score', 'id')
    pagination_class = None

    def get_queryset(self):
        qs = AssessmentResult.objects.with_town()
        if qp_int(self.request, 'year') is None or qp_int(self.request, 'month') is None:
            year, month = current_period()
            qs = qs.for_period(year, month)
        return qs

    def get_serializer_class(self):
        if self.action == 'create':
            return AssessmentRecomputeSerializer
        return AssessmentResultListSerializer

    def list(self, request, *args, **kwargs):
        year = qp_int(request, 'year') or current_period()[0]
        month = qp_int(request, 'month') or current_period()[1]
        queryset = self.filter_queryset(self.get_queryset())
        return ok({
            'list': AssessmentResultListSerializer(queryset, many=True).data,
            'total': queryset.count(),
            'year': year,
            'month': month,
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        year = serializer.validated_data.get('year') or current_period()[0]
        month = serializer.validated_data.get('month') or current_period()[1]
        computed = recompute_assessments(int(year), int(month))
        return ok({
            'computed': computed,
            'year': int(year),
            'month': int(month),
            'rules': AssessmentRuleListSerializer(AssessmentRule.objects.newest_first(), many=True).data,
        })


class AssessmentRuleViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    http_method_names = ['get', 'post', 'head', 'options']
    pagination_class = None

    def get_queryset(self):
        return AssessmentRule.objects.newest_first()

    def get_serializer_class(self):
        if self.action == 'create':
            return AssessmentRuleWriteSerializer
        return AssessmentRuleListSerializer

    def list(self, request, *args, **kwargs):
        return ok(AssessmentRuleListSerializer(self.get_queryset(), many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        rule = save_rule(**serializer.validated_data)
        return ok(AssessmentRuleListSerializer(rule).data)
