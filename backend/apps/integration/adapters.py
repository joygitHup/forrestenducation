import time
from django.utils import timezone

from apps.integration.models import ExternalSystem

ADAPTER_ACTIONS = {
    'national-patrol': '巡护/打卡数据同步',
    'province-fire-report': '火情上报推送到省即报系统',
    'city-emergency': '火情推送至应急指挥',
    'city-meteorology': '火险预警订阅/同步',
    'province-data-share': '基础信息核验请求',
    'city-river-lake': '空间边界对齐数据拉取',
    'badu-weather-broadcast': '应急广播预警推送',
}

PULL_ACTIONS = {
    'province-fire-report': '拉取卫星热点核销状态',
}


def has_adapter(slug):
    return slug in ADAPTER_ACTIONS


def dispatch(slug, action='push', payload=None):
    payload = payload or {}
    system = ExternalSystem.objects.by_slug(slug).first()
    trace_id = 'T%s_%s' % (int(time.time() * 1000), int(time.time() * 1000) % 10000)
    if not system:
        return {
            'success': False,
            'code': 404,
            'msg': '未注册系统',
            'trace_id': trace_id,
            'system_slug': slug,
        }
    if not system.enabled:
        return {
            'success': False,
            'code': 403,
            'msg': '系统「%s」未启用对接' % system.name,
            'trace_id': trace_id,
            'system_slug': slug,
        }
    if action == 'pull':
        label = PULL_ACTIONS.get(slug, '拉取数据')
    else:
        label = ADAPTER_ACTIONS.get(slug, '数据推送')
    return {
        'success': True,
        'code': 0,
        'msg': '%s %s 已受理（对接占位）' % (system.name, label),
        'data': {'action': label, 'payload': payload, 'received_at': timezone.now().isoformat()},
        'trace_id': trace_id,
        'system_slug': slug,
    }
