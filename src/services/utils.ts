// 通用业务辅助函数

import { EventReport, EventType, EventStatus, Ranger, OrgNode } from '@/types';

export const EVENT_TYPE_MAP: Record<EventType, string> = {
  1: '火情',
  2: '隐患',
  3: '破坏森林资源',
  4: '其他',
};

export const EVENT_STATUS_MAP: Record<EventStatus, string> = {
  0: '待处理',
  1: '处理中',
  2: '已闭环',
  3: '已驳回',
};

export function eventTypeName(t: EventType): string {
  return EVENT_TYPE_MAP[t] ?? '其他';
}

export function eventStatusName(s: EventStatus): string {
  return EVENT_STATUS_MAP[s] ?? '未知';
}

export function orgMap(orgs: OrgNode[]): Map<number, OrgNode> {
  return new Map(orgs.map(o => [o.id, o]));
}

export function townNameOf(orgs: OrgNode[], townId?: number): string {
  if (!townId) return '-';
  const node = orgMap(orgs).get(townId);
  return node?.name ?? '-';
}

export function rangerOnlineCount(rangers: Ranger[]): number {
  return rangers.filter(r => r.status === 1 && r.online).length;
}

export function maskPhone(phone: string): string {
  if (!phone || phone.length < 7) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-4);
}