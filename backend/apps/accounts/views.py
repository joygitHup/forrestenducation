from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.filters import OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from apps.accounts.filters import AdminUserFilter
from apps.accounts.models import AdminUser
from apps.accounts.serializers import AdminUserListSerializer, AdminUserWriteSerializer, LoginSerializer
from apps.accounts.services import create_user, delete_user, issue_token, update_user, verify_login
from apps.common.response import fail, ok


class AuthViewSet(viewsets.GenericViewSet):
    def get_serializer_class(self):
        if self.action == 'login':
            return LoginSerializer
        return AdminUserListSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return fail('请填写用户名和密码', 400)
        user = verify_login(serializer.validated_data['username'], serializer.validated_data['password'])
        if not user:
            return fail('用户名或密码错误', 401)
        return ok({'user': AdminUserListSerializer(user).data, 'token': issue_token(user)})

    @action(detail=False, methods=['get'])
    def users(self, request):
        return ok(AdminUserListSerializer(AdminUser.objects.with_town(), many=True).data)


class AdminUserViewSet(viewsets.ModelViewSet):
    http_method_names = ['get', 'post', 'put', 'delete', 'head', 'options']
    filterset_class = AdminUserFilter
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    ordering_fields = ('id', 'username', 'role')
    ordering = ('id',)
    pagination_class = None

    def get_queryset(self):
        return AdminUser.objects.with_town()

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return AdminUserWriteSerializer
        return AdminUserListSerializer

    def list(self, request, *args, **kwargs):
        return ok(self.get_serializer(self.filter_queryset(self.get_queryset()), many=True).data)

    def retrieve(self, request, *args, **kwargs):
        return ok(AdminUserListSerializer(self.get_object()).data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = create_user(**serializer.validated_data)
        return ok(AdminUserListSerializer(AdminUser.objects.with_town().get(pk=user.pk)).data, status=201)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        user = update_user(instance, **serializer.validated_data)
        return ok(AdminUserListSerializer(AdminUser.objects.with_town().get(pk=user.pk)).data)

    def destroy(self, request, *args, **kwargs):
        ok_flag, reason = delete_user(self.get_object())
        if not ok_flag:
            return fail(reason, 400)
        return ok(True)
