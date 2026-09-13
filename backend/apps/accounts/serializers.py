from rest_framework import serializers

from apps.accounts.constants import ADMIN_ROLE_TEXT, AdminRole
from apps.accounts.models import AdminUser
from apps.org.models import OrgNode


class AdminUserListSerializer(serializers.ModelSerializer):
    townId = serializers.IntegerField(source='town_id', allow_null=True, read_only=True)
    townName = serializers.CharField(source='town.name', default=None, allow_null=True, read_only=True)
    roleName = serializers.SerializerMethodField()

    class Meta:
        model = AdminUser
        fields = ('id', 'username', 'name', 'role', 'roleName', 'townId', 'townName')

    def get_roleName(self, obj):
        return ADMIN_ROLE_TEXT.get(obj.role, obj.role)


class AdminUserWriteSerializer(serializers.ModelSerializer):
    townId = serializers.PrimaryKeyRelatedField(
        source='town', queryset=OrgNode.objects.towns(), required=False, allow_null=True,
    )

    class Meta:
        model = AdminUser
        fields = ('username', 'name', 'role', 'townId')
        extra_kwargs = {'username': {'validators': []}}

    def to_internal_value(self, data):
        data = data.copy()
        if 'town_id' in data and 'townId' not in data:
            data['townId'] = data.get('town_id')
        if data.get('townId') in (0, '0', ''):
            data['townId'] = None
        return super().to_internal_value(data)

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError('用户名为必填项')
        qs = AdminUser.objects.by_username(username)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('用户名已存在')
        return username

    def validate_role(self, value):
        if value not in AdminRole.values:
            raise serializers.ValidationError('角色不合法')
        return value

    def validate(self, attrs):
        role = attrs.get('role') or getattr(self.instance, 'role', None)
        town = attrs['town'] if 'town' in attrs else getattr(self.instance, 'town', None)
        if role == AdminRole.TOWN and not town:
            raise serializers.ValidationError({'townId': '乡镇管理员必须选择所属乡镇'})
        if role != AdminRole.TOWN:
            attrs['town'] = None
        return attrs


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()
