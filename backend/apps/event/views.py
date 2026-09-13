from rest_framework import mixins, viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.response import fail, ok
from apps.event.filters import EventFilter, WarningFilter
from apps.event.models import Event, Warning
from apps.event.serializers import (
    EventDetailSerializer,
    EventHandleSerializer,
    EventListSerializer,
    EventWriteSerializer,
    WarningListSerializer,
    WarningWriteSerializer,
)
from apps.event.services import create_event, get_event_stats, handle_event, set_warning_status


class EventViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'head', 'options']
    filterset_class = EventFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('created_at', 'status', 'type', 'id')
    ordering = ('-created_at',)
    pagination_class = None

    def get_queryset(self):
        return Event.objects.select_related('town', 'ranger')

    def get_serializer_class(self):
        if self.action == 'list':
            return EventListSerializer
        if self.action == 'retrieve':
            return EventDetailSerializer
        if self.action == 'update':
            return EventHandleSerializer
        return EventWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        return ok({
            'list': EventListSerializer(queryset, many=True).data,
            'total': queryset.count(),
        })

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = create_event(**serializer.validated_data)
        return ok(EventListSerializer(Event.objects.select_related('town', 'ranger').get(pk=event.pk)).data, status=201)

    def retrieve(self, request, *args, **kwargs):
        return ok(EventDetailSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        serializer = EventHandleSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = handle_event(self.get_object(), **serializer.validated_data)
        return ok(EventListSerializer(Event.objects.select_related('town', 'ranger').get(pk=event.pk)).data)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        return ok(get_event_stats())


class WarningViewSet(mixins.ListModelMixin, viewsets.GenericViewSet):
    filterset_class = WarningFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('created_at', 'status', 'level')
    ordering = ('status', '-created_at')
    pagination_class = None

    def get_queryset(self):
        return Warning.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return WarningListSerializer
        return WarningWriteSerializer

    def list(self, request, *args, **kwargs):
        return ok(WarningListSerializer(self.filter_queryset(self.get_queryset()), many=True).data)

    def set_status(self, request, *args, **kwargs):
        serializer = WarningWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        warning = Warning.objects.filter(pk=serializer.validated_data['id']).first()
        if not warning:
            return fail('未找到预警', 404)
        warning = set_warning_status(warning, serializer.validated_data['status'])
        return ok(WarningListSerializer(warning).data)
