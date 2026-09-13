// 事件管理服务

import { store, nextId } from '@/data/memoryDB';
import { EventReport, EventStatus, EventType } from '@/types';
import { eventStatusName, eventTypeName, townNameOf, EVENT_STATUS_MAP } from './utils';

export interface EventQuery {
  status?: string;
  type?: string;
  townId?: number;
  page?: number;
  size?: number;
}

export function listEvents(query: EventQuery = {}) {
  const page = query.page ?? 1;
  const size = query.size ?? 20;
  let list = [...store.events];
  if (query.status !== undefined && query.status !== '') {
    list = list.filter(e => e.status === Number(query.status));
  }
  if (query.type !== undefined && query.type !== '') {
    list = list.filter(e => e.type === Number(query.type));
  }
  if (query.townId) list = list.filter(e => e.townId === query.townId);
  list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = list.length;
  const start = (page - 1) * size;
  const data = list.slice(start, start + size).map(e => serializeEvent(e));
  return { total, list: data, page, size };
}

function serializeEvent(e: EventReport) {
  return {
    ...e,
    typeName: eventTypeName(e.type),
    statusName: eventStatusName(e.status),
    townName: townNameOf(store.orgs, e.townId),
  };
}

export function getEvent(id: number) {
  const e = store.events.find(x => x.id === id);
  return e ? serializeEvent(e) : null;
}

export interface EventInput {
  type: EventType;
  description?: string;
  images?: string[];
  lng?: number;
  lat?: number;
  address?: string;
  rangerId?: number;
  townId?: number;
}

export function createEvent(input: EventInput): EventReport {
  const event: EventReport = {
    id: nextId(),
    rangerId: input.rangerId ?? 0,
    type: input.type,
    description: input.description ?? '',
    images: input.images ?? [],
    lng: input.lng,
    lat: input.lat,
    address: input.address,
    townId: input.townId,
    status: 0,
    createdAt: new Date().toISOString(),
  };
  if (input.rangerId) {
    const r = store.rangers.find(x => x.id === input.rangerId);
    event.rangerName = r?.name;
    event.townId = event.townId ?? r?.townId;
  }
  store.events.push(event);
  return event;
}

export interface HandleInput {
  status: EventStatus;
  note?: string;
  handlerName?: string;
}

export function handleEvent(id: number, input: HandleInput): EventReport | null {
  const idx = store.events.findIndex(e => e.id === id);
  if (idx < 0) return null;
  const cur = store.events[idx];
  const updated: EventReport = {
    ...cur,
    status: input.status,
    handleNote: input.note ?? cur.handleNote,
    handlerName: input.handlerName,
    handleTime: new Date().toISOString(),
  };
  store.events[idx] = updated;
  return updated;
}

// 事件统计：按状态与类型分组
export function eventStats() {
  const byStatus: Record<string, number> = {};
  const byType: Record<string, number> = {};
  let timeout = 0;
  store.events.forEach(e => {
    byStatus[EVENT_STATUS_MAP[e.status]] = (byStatus[EVENT_STATUS_MAP[e.status]] ?? 0) + 1;
    byType[eventTypeName(e.type)] = (byType[eventTypeName(e.type)] ?? 0) + 1;
    if (e.status === 0) {
      const age = Date.now() - new Date(e.createdAt).getTime();
      if (age > 2 * 3600 * 1000) timeout++;
    }
  });
  return { byStatus, byType, total: store.events.length, timeoutEvents: timeout };
}