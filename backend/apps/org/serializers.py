from rest_framework import serializers

from apps.org.constants import ORG_LEVEL_TEXT, OrgLevel
from apps.org.models import OrgNode


class OrgListSerializer(serializers.ModelSerializer):
    parentId = serializers.IntegerField(source='parent_id', read_only=True)
    parentName = serializers.SerializerMethodField()
    levelName = serializers.SerializerMethodField()

    class Meta:
        model = OrgNode
        fields = ('id', 'name', 'parentId', 'parentName', 'level', 'levelName')

    def get_parentName(self, obj):
        if not obj.parent_id:
            return '-'
        names = self.context.get('parent_names')
        if names is None:
            names = dict(OrgNode.objects.values_list('id', 'name'))
            self.context['parent_names'] = names
        return names.get(obj.parent_id, '-')

    def get_levelName(self, obj):
        return ORG_LEVEL_TEXT.get(obj.level, '未知')


class OrgOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrgNode
        fields = ('id', 'name')


class OrgWriteSerializer(serializers.ModelSerializer):
    parentId = serializers.IntegerField(source='parent_id', required=False, default=0)

    class Meta:
        model = OrgNode
        fields = ('name', 'level', 'parentId')

    def to_internal_value(self, data):
        data = data.copy()
        if 'parent_id' in data and 'parentId' not in data:
            data['parentId'] = data.get('parent_id')
        if data.get('parentId') in ('', None):
            data['parentId'] = 0
        return super().to_internal_value(data)

    def validate_level(self, value):
        if value not in OrgLevel.values:
            raise serializers.ValidationError('组织层级不合法')
        return value

    def validate(self, attrs):
        level = attrs.get('level')
        parent_id = attrs.get('parent_id', 0)
        if level == OrgLevel.DISTRICT and parent_id:
            raise serializers.ValidationError({'parentId': '区级组织无需上级'})
        if level == OrgLevel.TOWN:
            parent = OrgNode.objects.filter(pk=parent_id).first()
            if not parent or parent.level != OrgLevel.DISTRICT:
                raise serializers.ValidationError({'parentId': '乡镇必须选择所属区'})
        if level == OrgLevel.VILLAGE:
            parent = OrgNode.objects.filter(pk=parent_id).first()
            if not parent or parent.level != OrgLevel.TOWN:
                raise serializers.ValidationError({'parentId': '村必须选择所属乡镇'})
        return attrs
