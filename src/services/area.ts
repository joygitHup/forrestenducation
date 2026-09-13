// 责任区域管理服务

import { store, nextId } from '@/data/memoryDB';
import { ResponsibilityArea, KeyPoint } from '@/types';
import { townNameOf } from './utils';

export function listAreas() {
  return store.areas.map(a => {
    const ranger = a.rangerName
      ? store.rangers.find(r => r.areaId === a.id && r.status === 1)
      : undefined;
    return { ...a, townName: townNameOf(store.orgs, a.townId), rangerName: ranger?.name ?? a.rangerName };
  });
}

export interface AreaInput {
  name: string;
  townId: number;
  boundary: [number, number][];
  areaSize?: number;
  keyPoints?: KeyPoint[];
}

export function createArea(input: AreaInput): ResponsibilityArea {
  const area: ResponsibilityArea = {
    id: nextId(),
    name: input.name,
    townId: input.townId,
    boundary: input.boundary,
    areaSize: input.areaSize,
    keyPoints: input.keyPoints ?? [],
    createdAt: new Date().toISOString(),
  };
  store.areas.push(area);
  return area;
}

export function updateArea(id: number, input: Partial<AreaInput>): ResponsibilityArea | null {
  const idx = store.areas.findIndex(a => a.id === id);
  if (idx < 0) return null;
  store.areas[idx] = { ...store.areas[idx], ...input, id };
  return store.areas[idx];
}

export function deleteArea(id: number): boolean {
  const idx = store.areas.findIndex(a => a.id === id);
  if (idx < 0) return false;
  // 若区域被护林员引用则禁止删除
  const used = store.rangers.some(r => r.areaId === id);
  if (used) return false;
  store.areas.splice(idx, 1);
  return true;
}