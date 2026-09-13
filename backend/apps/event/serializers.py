from rest_framework import serializers

from apps.event.constants import (
    EVENT_STATUS_TEXT,
    EVENT_TYPE_TEXT,
    WARNING_LEVEL_TEXT,
    WARNING_TYPE_TEXT,
    EventStatus,
    EventType,
    WarningStatus,
)
from apps.event.models import Event, Warning
from apps.org.models import OrgNode
from apps.ranger.models import Ranger


class EventListSerializer(serializers.ModelSerializer):
    rangerId = serializers.IntegerField(source='ranger_id', allow_null=True, read_only=True)
    rangerName = serializers.SerializerMethodField()
    townId = serializers.IntegerField(source='town_id', allow_null=True, read_only=True)
    townName = serializers.CharField(source='town.name', default='-', read_only=True)
    typeName = serializers.SerializerMethodField()
    statusName = serializers.SerializerMethodField()
    handlerId = serializers.IntegerField(source='handler_id', allow_null=True, read_only=True)
    handlerName = serializers.CharField(source='handler_name', read_only=True)
    handleNote = serializers.CharField(source='handle_note', read_only=True)
    handleTime = serializers.DateTimeField(source='handle_time', allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Event
        fields = (
            'id', 'rangerId', 'rangerName', 'townId', 'townName', 'type', 'typeName',
            'description', 'images', 'lng', 'lat', 'address', 'status', 'statusName',
            'handlerId', 'handlerName', 'handleNote', 'handleTime', 'createdAt',
        )

    def get_rangerName(self, obj):
        if obj.ranger_id and getattr(obj, 'ranger', None):
            return obj.ranger.name
        return obj.ranger_name or None

    def get_typeName(self, obj):
        return EVENT_TYPE_TEXT.get(obj.type, '其他')

    def get_statusName(self, obj):
        return EVENT_STATUS_TEXT.get(obj.status, '未知')


class EventDetailSerializer(EventListSerializer):
    pass


class EventWriteSerializer(serializers.ModelSerializer):
    rangerId = serializers.PrimaryKeyRelatedField(
        source='ranger', queryset=Ranger.objects.all(), required=False, allow_null=True,
    )
    townId = serializers.PrimaryKeyRelatedField(
        source='town', queryset=OrgNode.objects.all(), required=False, allow_null=True,
    )

    class Meta:
        model = Event
        fields = ('type', 'description', 'images', 'lng', 'lat', 'address', 'rangerId', 'townId')

    def to_internal_value(self, data):
        data = data.copy()
        aliases = (('ranger_id', 'rangerId'), ('town_id', 'townId'))
        for snake, camel in aliases:
            if snake in data and camel not in data:
                data[camel] = data[snake]
        for key in ('rangerId', 'townId'):
            if data.get(key) in (0, '0', ''):
                data[key] = None
        return super().to_internal_value(data)

    def validate_type(self, value):
        if value not in EventType.values:
            raise serializers.ValidationError('事件类型不合法')
        return value


class EventHandleSerializer(serializers.Serializer):
    status = serializers.IntegerField()
    note = serializers.CharField(required=False, allow_blank=True, default='')
    handlerName = serializers.CharField(source='handler_name', required=False, allow_blank=True, default='')

    def to_internal_value(self, data):
        data = data.copy()
        if 'handler_name' in data and 'handlerName' not in data:
            data['handlerName'] = data.get('handler_name')
        return super().to_internal_value(data)

    def validate_status(self, value):
        if value not in EventStatus.values:
            raise serializers.ValidationError('状态不合法')
        return value


class WarningListSerializer(serializers.ModelSerializer):
    rangerName = serializers.CharField(source='ranger_name', read_only=True)
    townName = serializers.CharField(source='town_name', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    typeName = serializers.SerializerMethodField()
    levelName = serializers.SerializerMethodField()

    class Meta:
        model = Warning
        fields = (
            'id', 'type', 'typeName', 'title', 'rangerName', 'townName',
            'detail', 'level', 'levelName', 'status', 'createdAt',
        )

    def get_typeName(self, obj):
        return WARNING_TYPE_TEXT.get(obj.type, obj.type)

    def get_levelName(self, obj):
        return WARNING_LEVEL_TEXT.get(obj.level, obj.level)


class WarningWriteSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    status = serializers.IntegerField()

    def validate_status(self, value):
        if value not in WarningStatus.values:
            raise serializers.ValidationError('状态不合法')
        return value
