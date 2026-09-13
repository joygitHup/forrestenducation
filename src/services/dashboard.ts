// 看板服务

import { store } from '@/data/memoryDB';
import { DashboardStats, WarningItem } from '@/types';
import { eventTypeName, EVENT_STATUS_MAP, rangerOnlineCount, townNameOf } from './utils';

export function getDashboard(): DashboardStats {
  const rangers = store.rangers.filter(r => r.status === 1);
  const today = new Date().toDateString();

  const todayPatrols = store.patrols.filter(
    p => p.status === 1 && new Date(p.startTime).toDateString() === today,
  );
  const todayPatrolRate = rangers.length
    ? Math.round((new Set(todayPatrols.map(p => p.rangerId)).size / rangers.length) * 100) / 100
    : 0;

  const pendingEvents = store.events.filter(e => e.status === 0).length;

  const todayDistance = todayPatrols.reduce((s, p) => s + (p.distance ?? 0), 0);

  const checkinAvg =
    rangers.length > 0
      ? Math.round((rangers.reduce((s, r) => s + (r.monthCheckinRate ?? 0), 0) / rangers.length) * 100) / 100
      : 0;

  // 近7天巡护趋势
  const weeklyTrend: DashboardStats['weeklyTrend'] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const ds = d.toDateString();
    const dayPatrols = store.patrols.filter(p => new Date(p.startTime).toDateString() === ds);
    weeklyTrend.push({
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      patrolCount: dayPatrols.length,
      distance: Math.round(dayPatrols.reduce((s, p) => s + (p.distance ?? 0), 0) * 10) / 10,
    });
  }

  // 事件类型统计
  const typeCount: Record<number, number> = {};
  store.events.forEach(e => {
    typeCount[e.type] = (typeCount[e.type] ?? 0) + 1;
  });
  const eventTypeStats: DashboardStats['eventTypeStats'] = Object.entries(typeCount).map(
    ([t, count]) => ({ type: Number(t) as DashboardStats['eventTypeStats'][number]['type'], typeName: eventTypeName(Number(t) as never), count }),
  );

  return {
    rangerTotal: rangers.length,
    onlineCount: rangerOnlineCount(store.rangers),
    todayPatrolRate,
    pendingEvents,
    todayDistance: Math.round(todayDistance * 10) / 10,
    checkinAvgRate: checkinAvg,
    weeklyTrend,
    eventTypeStats,
  };
}

export function getWarnings(filters?: { type?: string; status?: string }): WarningItem[] {
  let list = [...store.warnings];
  if (filters?.type) list = list.filter(w => w.type === filters.type);
  if (filters?.status !== undefined && filters.status !== '') {
    list = list.filter(w => w.status === Number(filters.status));
  }
  return list.sort((a, b) => (a.status - b.status) || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getEventStats() {
  return store.events.map(e => ({
    id: e.id,
    type: e.type,
    typeName: eventTypeName(e.type),
    status: e.status,
    statusName: EVENT_STATUS_MAP[e.status],
    townName: townNameOf(store.orgs, e.townId),
  }));
}