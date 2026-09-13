from rest_framework import mixins, viewsets
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.models import AdminUser
from apps.accounts.serializers import AdminUserListSerializer
from apps.common.query import qp, qp_int
from apps.common.response import fail, ok
from apps.org.filters import OrgFilter
from apps.org.models import OrgNode
from apps.org.serializers import OrgListSerializer, OrgOptionSerializer, OrgWriteSerializer
from apps.org.services import create_org, delete_org, update_org


class OrgViewSet(mixins.CreateModelMixin, mixins.DestroyModelMixin, mixins.ListModelMixin, mixins.UpdateModelMixin, viewsets.GenericViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    filterset_class = OrgFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('level', 'id', 'name')
    ordering = ('level', 'id')
    pagination_class = None

    def get_queryset(self):
        return OrgNode.objects.tree()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OrgWriteSerializer
        return OrgListSerializer

    def list(self, request, *args, **kwargs):
        kind = qp(request, 'kind')
        if kind == 'town':
            return ok(OrgOptionSerializer(OrgNode.objects.towns(), many=True).data)
        if kind == 'village':
            return ok(OrgOptionSerializer(OrgNode.objects.villages(qp_int(request, 'townId', 'town_id')), many=True).data)
        if kind == 'users':
            return ok(AdminUserListSerializer(AdminUser.objects.with_town(), many=True).data)
        queryset = self.filter_queryset(self.get_queryset())
        return ok(OrgListSerializer(queryset, many=True).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        org = create_org(**serializer.validated_data)
        return ok(OrgListSerializer(org).data, status=201)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        org = update_org(instance, **serializer.validated_data)
        return ok(OrgListSerializer(org).data)

    def destroy(self, request, *args, **kwargs):
        ok_flag, reason = delete_org(self.get_object())
        if not ok_flag:
            return fail(reason, 400)
        return ok(True)
