from rest_framework import serializers

from apps.common.utils import mask_phone
from apps.org.models import OrgNode
from apps.ranger.constants import RangerStatus
from apps.ranger.models import Area, Patrol, Ranger


class AreaListSerializer(serializers.ModelSerializer):
    townId = serializers.IntegerField(source='town_id', read_only=True)
    townName = serializers.CharField(source='town.name', default='-', read_only=True)
    rangerName = serializers.SerializerMethodField()
    areaSize = serializers.FloatField(source='area_size', read_only=True)
    keyPoints = serializers.JSONField(source='key_points', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Area
        fields = (
            'id', 'name', 'townId', 'boundary', 'areaSize', 'keyPoints',
            'createdAt', 'townName', 'rangerName',
        )

    def get_rangerName(self, obj):
        assigned = getattr(obj, 'active_rangers', None)
        if assigned:
            return assigned[0].name
        return obj.ranger_name or None


class AreaWriteSerializer(serializers.ModelSerializer):
    townId = serializers.PrimaryKeyRelatedField(source='town', queryset=OrgNode.objects.towns())
    areaSize = serializers.FloatField(source='area_size', required=False, allow_null=True)
    keyPoints = serializers.JSONField(source='key_points', required=False)

    class Meta:
        model = Area
        fields = ('name', 'townId', 'boundary', 'areaSize', 'keyPoints')
        extra_kwargs = {'boundary': {'required': False}}

    def to_internal_value(self, data):
        data = data.copy()
        aliases = (('town_id', 'townId'), ('area_size', 'areaSize'), ('key_points', 'keyPoints'))
        for snake, camel in aliases:
            if snake in data and camel not in data:
                data[camel] = data[snake]
        if data.get('areaSize') in ('',):
            data['areaSize'] = None
        return super().to_internal_value(data)

    def validate_areaSize(self, value):
        if value is not None and value < 0:
            raise serializers.ValidationError('面积不能为负数')
        return value

    def validate_keyPoints(self, value):
        if value in (None, ''):
            return []
        if not isinstance(value, list):
            raise serializers.ValidationError('keyPoints 必须是数组')
        cleaned = []
        for item in value:
            if not isinstance(item, dict) or not str(item.get('name', '')).strip():
                raise serializers.ValidationError('打点需包含名称')
            try:
                cleaned.append({
                    'name': str(item['name']).strip(),
                    'lng': float(item.get('lng')),
                    'lat': float(item.get('lat')),
                    'radius': float(item.get('radius') or 100),
                })
            except (TypeError, ValueError):
                raise serializers.ValidationError('打点经纬度或半径格式不正确')
        return cleaned


class PatrolListSerializer(serializers.ModelSerializer):
    rangerId = serializers.IntegerField(source='ranger_id', read_only=True)
    rangerName = serializers.CharField(source='ranger_name', read_only=True)
    townId = serializers.IntegerField(source='town_id', read_only=True, allow_null=True)
    startTime = serializers.DateTimeField(source='start_time', read_only=True)
    endTime = serializers.DateTimeField(source='end_time', read_only=True)
    keyPointsHit = serializers.JSONField(source='key_points_hit', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Patrol
        fields = (
            'id', 'rangerId', 'rangerName', 'townId', 'startTime', 'endTime',
            'distance', 'duration', 'track', 'keyPointsHit', 'status', 'createdAt',
        )


class RangerListSerializer(serializers.ModelSerializer):
    townId = serializers.IntegerField(source='town_id', read_only=True)
    villageId = serializers.IntegerField(source='village_id', read_only=True, allow_null=True)
    areaId = serializers.IntegerField(source='area_id', read_only=True, allow_null=True)
    idCard = serializers.CharField(source='id_card', read_only=True)
    avatarUrl = serializers.CharField(source='avatar_url', read_only=True)
    hireDate = serializers.DateField(source='hire_date', read_only=True)
    monthDistance = serializers.FloatField(source='month_distance', read_only=True)
    monthCheckinRate = serializers.FloatField(source='month_checkin_rate', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    townName = serializers.CharField(source='town.name', default='-', read_only=True)
    villageName = serializers.CharField(source='village.name', default=None, allow_null=True, read_only=True)
    areaName = serializers.CharField(source='area.name', default=None, allow_null=True, read_only=True)
    phoneMasked = serializers.SerializerMethodField()

    class Meta:
        model = Ranger
        fields = (
            'id', 'name', 'phone', 'phoneMasked', 'idCard', 'townId', 'villageId', 'areaId',
            'avatarUrl', 'status', 'hireDate', 'online', 'monthDistance', 'monthCheckinRate',
            'score', 'createdAt', 'updatedAt', 'townName', 'villageName', 'areaName',
        )

    def get_phoneMasked(self, obj):
        return mask_phone(obj.phone)


class RangerDetailSerializer(RangerListSerializer):
    area = AreaListSerializer(read_only=True)
    patrols = PatrolListSerializer(many=True, read_only=True)
    events = serializers.SerializerMethodField()

    class Meta(RangerListSerializer.Meta):
        fields = RangerListSerializer.Meta.fields + ('area', 'patrols', 'events')

    def get_events(self, obj):
        from apps.event.serializers import EventListSerializer

        return EventListSerializer(obj.events.all(), many=True).data


class RangerWriteSerializer(serializers.ModelSerializer):
    townId = serializers.PrimaryKeyRelatedField(source='town', queryset=OrgNode.objects.towns())
    villageId = serializers.PrimaryKeyRelatedField(
        source='village', queryset=OrgNode.objects.villages(), allow_null=True, required=False,
    )
    areaId = serializers.PrimaryKeyRelatedField(
        source='area', queryset=Area.objects.all(), allow_null=True, required=False,
    )
    idCard = serializers.CharField(source='id_card', required=False, allow_blank=True, default='')
    hireDate = serializers.DateField(source='hire_date', required=False, allow_null=True)

    class Meta:
        model = Ranger
        fields = ('name', 'phone', 'idCard', 'townId', 'villageId', 'areaId', 'status', 'hireDate')
        extra_kwargs = {'phone': {'validators': []}}

    def to_internal_value(self, data):
        data = data.copy()
        aliases = (
            ('town_id', 'townId'),
            ('village_id', 'villageId'),
            ('area_id', 'areaId'),
            ('id_card', 'idCard'),
            ('hire_date', 'hireDate'),
        )
        for snake, camel in aliases:
            if snake in data and camel not in data:
                data[camel] = data[snake]
        for key in ('villageId', 'areaId', 'hireDate'):
            if data.get(key) in (0, '0', ''):
                data[key] = None
        return super().to_internal_value(data)

    def validate_phone(self, value):
        qs = Ranger.objects.by_phone(value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('手机号已存在')
        return value

    def validate_status(self, value):
        if value not in RangerStatus.values:
            raise serializers.ValidationError('状态不合法')
        return value

    def validate(self, attrs):
        town = attrs.get('town') or getattr(self.instance, 'town', None)
        village = attrs['village'] if 'village' in attrs else getattr(self.instance, 'village', None)
        area = attrs['area'] if 'area' in attrs else getattr(self.instance, 'area', None)
        if village and town and village.parent_id != town.id:
            raise serializers.ValidationError({'villageId': '行政村不属于所选乡镇'})
        if area and town and area.town_id != town.id:
            raise serializers.ValidationError({'areaId': '责任区域不属于所选乡镇'})
        return attrs
