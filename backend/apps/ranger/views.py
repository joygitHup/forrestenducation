from rest_framework import viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.common.response import fail, ok
from apps.ranger.filters import AreaFilter, RangerFilter
from apps.ranger.models import Area, Ranger
from apps.ranger.serializers import (
    AreaListSerializer,
    AreaWriteSerializer,
    RangerDetailSerializer,
    RangerListSerializer,
    RangerWriteSerializer,
)
from apps.ranger.services import create_area, create_ranger, delete_area, delete_ranger, update_area, update_ranger


class RangerViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    filterset_class = RangerFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('id', 'score', 'month_distance', 'created_at')
    ordering = ('id',)

    def get_queryset(self):
        qs = Ranger.objects.with_relations()
        if self.action == 'retrieve':
            return qs.prefetch_related('patrols', 'events__town')
        return qs

    def get_serializer_class(self):
        if self.action == 'list':
            return RangerListSerializer
        if self.action == 'retrieve':
            return RangerDetailSerializer
        return RangerWriteSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        serializer = self.get_serializer(page if page is not None else queryset, many=True)
        if page is None:
            return ok(serializer.data)
        return self.get_paginated_response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        ranger = create_ranger(online=False, **serializer.validated_data)
        return ok(RangerListSerializer(Ranger.objects.with_relations().get(pk=ranger.pk)).data, status=201)

    def retrieve(self, request, *args, **kwargs):
        return ok(RangerDetailSerializer(self.get_object()).data)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        ranger = update_ranger(instance, **serializer.validated_data)
        return ok(RangerListSerializer(Ranger.objects.with_relations().get(pk=ranger.pk)).data)

    def destroy(self, request, *args, **kwargs):
        delete_ranger(self.get_object())
        return ok(True)


class AreaViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    filterset_class = AreaFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('id', 'area_size', 'created_at')
    ordering = ('id',)
    pagination_class = None

    def get_queryset(self):
        return Area.objects.with_town().with_assigned_rangers()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return AreaWriteSerializer
        return AreaListSerializer

    def list(self, request, *args, **kwargs):
        return ok(self.get_serializer(self.filter_queryset(self.get_queryset()), many=True).data)

    def retrieve(self, request, *args, **kwargs):
        return ok(self.get_serializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        area = create_area(**serializer.validated_data)
        return ok(AreaListSerializer(self.get_queryset().get(pk=area.pk)).data, status=201)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        area = update_area(instance, **serializer.validated_data)
        return ok(AreaListSerializer(self.get_queryset().get(pk=area.pk)).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not delete_area(instance):
            return fail('区域被护林员引用或在删除中失败', 400)
        return ok(True)
