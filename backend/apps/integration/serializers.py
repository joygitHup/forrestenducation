from rest_framework import serializers

from apps.integration.adapters import has_adapter
from apps.integration.models import ExternalSystem


class ExternalSystemListSerializer(serializers.ModelSerializer):
    has_adapter = serializers.SerializerMethodField()

    class Meta:
        model = ExternalSystem
        fields = (
            'id', 'slug', 'name', 'category', 'priority', 'base_url', 'auth_type',
            'enabled', 'direction', 'desc', 'endpoints', 'has_adapter',
        )

    def get_has_adapter(self, obj):
        return has_adapter(obj.slug)


class ExternalSystemWriteSerializer(serializers.Serializer):
    slug = serializers.CharField()
    enabled = serializers.BooleanField()


class IntegrateWriteSerializer(serializers.Serializer):
    system = serializers.CharField()
    action = serializers.CharField(required=False, default='push')
    payload = serializers.DictField(required=False, default=dict)
