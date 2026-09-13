// 护林员管理服务

import { store, nextId } from '@/data/memoryDB';
import { Ranger } from '@/types';
import { maskPhone, orgMap, townNameOf } from './utils';

export interface RangerQuery {
  keyword?: string;
  townId?: number;
  status?: string;
  page?: number;
  size?: number;
}

export function listRangers(query: RangerQuery = {}) {
  const page = query.page ?? 1;
  const size = query.size ?? 20;
  let list = [...store.rangers];
  if (query.keyword) {
    const kw = query.keyword.trim();
    list = list.filter(
      r => r.name.includes(kw) || r.phone.includes(kw) || (r.idCard ?? '').includes(kw),
    );
  }
  if (query.townId) list = list.filter(r => r.townId === query.townId);
  if (query.status !== undefined && query.status !== '') {
    list = list.filter(r => r.status === Number(query.status));
  }
  const orgs = orgMap(store.orgs);
  const total = list.length;
  const start = (page - 1) * size;
  const data = list
    .slice(start, start + size)
    .map(r => ({
      ...r,
      townName: townNameOf(store.orgs, r.townId),
      villageName: r.villageId ? orgs.get(r.villageId)?.name : undefined,
      areaName: store.areas.find(a => a.id === r.areaId)?.name,
      phoneMasked: maskPhone(r.phone),
    }));
  return { total, list: data, page, size };
}

export function getRanger(id: number) {
  const r = store.rangers.find(x => x.id === id);
  if (!r) return null;
  const orgs = orgMap(store.orgs);
  const area = store.areas.find(a => a.id === r.areaId);
  const patrols = store.patrols
    .filter(p => p.rangerId === id)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const events = store.events
    .filter(e => e.rangerId === id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return {
    ...r,
    townName: townNameOf(store.orgs, r.townId),
    villageName: r.villageId ? orgs.get(r.villageId)?.name : undefined,
    area,
    areaName: area?.name,
    phoneMasked: maskPhone(r.phone),
    patrols,
    events,
  };
}

export interface RangerInput {
  name: string;
  phone: string;
  idCard?: string;
  townId: number;
  villageId?: number;
  areaId?: number;
  avatarUrl?: string;
  status?: 1 | 0;
  hireDate?: string;
}

export function createRanger(input: RangerInput): Ranger {
  const now = new Date().toISOString();
  const ranger: Ranger = {
    id: nextId(),
    name: input.name,
    phone: input.phone,
    idCard: input.idCard,
    townId: input.townId,
    villageId: input.villageId,
    areaId: input.areaId,
    avatarUrl: input.avatarUrl,
    status: input.status ?? 1,
    hireDate: input.hireDate,
    online: false,
    createdAt: now,
    updatedAt: now,
  };
  store.rangers.push(ranger);
  return ranger;
}

export function updateRanger(id: number, input: Partial<RangerInput>): Ranger | null {
  const idx = store.rangers.findIndex(r => r.id === id);
  if (idx < 0) return null;
  const cur = store.rangers[idx];
  const updated: Ranger = {
    ...cur,
    ...input,
    id: cur.id,
    createdAt: cur.createdAt,
    updatedAt: new Date().toISOString(),
  };
  store.rangers[idx] = updated;
  return updated;
}

export function deleteRanger(id: number): boolean {
  const idx = store.rangers.findIndex(r => r.id === id);
  if (idx < 0) return false;
  store.rangers.splice(idx, 1);
  return true;
}