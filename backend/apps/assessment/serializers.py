from rest_framework import serializers

from apps.assessment.constants import score_level
from apps.assessment.models import AssessmentResult, AssessmentRule


class AssessmentRuleListSerializer(serializers.ModelSerializer):
    patrolWeight = serializers.IntegerField(source='patrol_weight', read_only=True)
    eventWeight = serializers.IntegerField(source='event_weight', read_only=True)
    studyWeight = serializers.IntegerField(source='study_weight', read_only=True)
    patrolTarget = serializers.FloatField(source='patrol_target', allow_null=True, read_only=True)
    checkinTarget = serializers.IntegerField(source='checkin_target', allow_null=True, read_only=True)
    effectiveDate = serializers.DateField(source='effective_date', allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = AssessmentRule
        fields = (
            'id', 'name', 'patrolWeight', 'eventWeight', 'studyWeight',
            'patrolTarget', 'checkinTarget', 'effectiveDate', 'createdAt',
        )


class AssessmentRuleWriteSerializer(serializers.ModelSerializer):
    patrolWeight = serializers.IntegerField(source='patrol_weight')
    eventWeight = serializers.IntegerField(source='event_weight')
    studyWeight = serializers.IntegerField(source='study_weight')
    patrolTarget = serializers.FloatField(source='patrol_target', required=False, allow_null=True)
    checkinTarget = serializers.IntegerField(source='checkin_target', required=False, allow_null=True)
    effectiveDate = serializers.DateField(source='effective_date', required=False, allow_null=True)

    class Meta:
        model = AssessmentRule
        fields = (
            'name', 'patrolWeight', 'eventWeight', 'studyWeight',
            'patrolTarget', 'checkinTarget', 'effectiveDate',
        )

    def to_internal_value(self, data):
        data = data.copy()
        aliases = (
            ('patrol_weight', 'patrolWeight'),
            ('event_weight', 'eventWeight'),
            ('study_weight', 'studyWeight'),
            ('patrol_target', 'patrolTarget'),
            ('checkin_target', 'checkinTarget'),
            ('effective_date', 'effectiveDate'),
        )
        for snake, camel in aliases:
            if snake in data and camel not in data:
                data[camel] = data[snake]
        for key in ('patrolTarget', 'checkinTarget', 'effectiveDate'):
            if data.get(key) in ('',):
                data[key] = None
        return super().to_internal_value(data)

    def validate(self, attrs):
        total = attrs.get('patrol_weight', 0) + attrs.get('event_weight', 0) + attrs.get('study_weight', 0)
        if total != 100:
            raise serializers.ValidationError('三项权重之和必须为100')
        for key in ('patrol_weight', 'event_weight', 'study_weight'):
            if attrs.get(key, 0) < 0:
                raise serializers.ValidationError('权重不能为负数')
        if attrs.get('patrol_target') is not None and attrs['patrol_target'] < 0:
            raise serializers.ValidationError({'patrolTarget': '里程目标不能为负数'})
        if attrs.get('checkin_target') is not None and attrs['checkin_target'] < 0:
            raise serializers.ValidationError({'checkinTarget': '打点目标不能为负数'})
        return attrs


class AssessmentResultListSerializer(serializers.ModelSerializer):
    rangerId = serializers.IntegerField(source='ranger_id', read_only=True)
    rangerName = serializers.CharField(source='ranger.name', default=None, allow_null=True, read_only=True)
    townId = serializers.IntegerField(source='town_id', allow_null=True, read_only=True)
    townName = serializers.CharField(source='town.name', default='-', read_only=True)
    patrolScore = serializers.FloatField(source='patrol_score', read_only=True)
    eventScore = serializers.FloatField(source='event_score', read_only=True)
    studyScore = serializers.FloatField(source='study_score', read_only=True)
    totalScore = serializers.FloatField(source='total_score', read_only=True)
    rankInTown = serializers.IntegerField(source='rank_in_town', allow_null=True, read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    level = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentResult
        fields = (
            'id', 'rangerId', 'rangerName', 'townId', 'townName', 'year', 'month',
            'patrolScore', 'eventScore', 'studyScore', 'totalScore', 'rankInTown',
            'level', 'createdAt',
        )

    def get_level(self, obj):
        return score_level(obj.total_score)


class AssessmentRecomputeSerializer(serializers.Serializer):
    year = serializers.IntegerField(required=False)
    month = serializers.IntegerField(required=False)

    def validate_month(self, value):
        if value < 1 or value > 12:
            raise serializers.ValidationError('月份不合法')
        return value
