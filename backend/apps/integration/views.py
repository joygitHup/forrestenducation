from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.response import fail, ok
from apps.event.serializers import WarningListSerializer
from apps.integration.models import ExternalSystem
from apps.integration.queries import get_dashboard
from apps.integration.serializers import (
    ExternalSystemListSerializer,
    ExternalSystemWriteSerializer,
    IntegrateWriteSerializer,
)
from apps.integration.services import integrate, set_system_enabled


class DashboardViewSet(viewsets.GenericViewSet):
    def list(self, request, *args, **kwargs):
        payload = get_dashboard()
        payload['warnings'] = WarningListSerializer(payload['warnings'], many=True).data
        return ok(payload)


class ExternalSystemViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    def get_queryset(self):
        return ExternalSystem.objects.ordered()

    def get_serializer_class(self):
        if self.action == 'list':
            return ExternalSystemListSerializer
        return ExternalSystemWriteSerializer

    def list(self, request, *args, **kwargs):
        return ok(ExternalSystemListSerializer(self.get_queryset(), many=True).data)

    def update(self, request, *args, **kwargs):
        serializer = ExternalSystemWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        system = ExternalSystem.objects.by_slug(serializer.validated_data['slug']).first()
        if not system:
            return fail('未找到对接系统', 404)
        system = set_system_enabled(system, serializer.validated_data['enabled'])
        return ok(ExternalSystemListSerializer(system).data)

    @action(detail=False, methods=['post'])
    def integrate(self, request):
        serializer = IntegrateWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        result = integrate(
            serializer.validated_data['system'],
            serializer.validated_data.get('action') or 'push',
            serializer.validated_data.get('payload') or {},
        )
        return Response(result)


class HealthViewSet(viewsets.GenericViewSet):
    def list(self, request, *args, **kwargs):
        return ok({'status': 'ok'})
