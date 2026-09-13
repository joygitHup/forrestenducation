// 组织架构与用户权限服务

import { store, nextId } from '@/data/memoryDB';
import { OrgNode, AdminUser, ExternalSystem } from '@/types';

// ---------------- 组织架构 ----------------
export function getOrgTree(): OrgNode[] {
  return [...store.orgs].sort((a, b) => a.level - b.level || a.id - b.id);
}

export function listTowns(): { id: number; name: string }[] {
  return store.orgs.filter(o => o.level === 2).map(o => ({ id: o.id, name: o.name }));
}

export function listVillages(townId?: number): { id: number; name: string }[] {
  return store.orgs
    .filter(o => o.level === 3 && (!townId || o.parentId === townId))
    .map(o => ({ id: o.id, name: o.name }));
}

export interface OrgInput {
  name: string;
  parentId: number;
  level: 1 | 2 | 3;
}

export function createOrg(input: OrgInput): OrgNode {
  const org: OrgNode = { id: nextId(), ...input };
  store.orgs.push(org);
  return org;
}

export function deleteOrg(id: number): { ok: boolean; reason?: string } {
  const hasChild = store.orgs.some(o => o.parentId === id);
  if (hasChild) return { ok: false, reason: '存在下级组织，无法删除' };
  const used = store.rangers.some(r => r.townId === id || r.villageId === id);
  if (used) return { ok: false, reason: '组织下存在护林员，无法删除' };
  store.orgs = store.orgs.filter(o => o.id !== id);
  return { ok: true };
}

// ---------------- 用户权限 ----------------
export function listAdminUsers(): AdminUser[] {
  return store.adminUsers.map(u => ({ ...u }));
}

export function verifyLogin(username: string, password: string): AdminUser | null {
  // 演示环境：admin/任何非空密码即可登录（真实环境应接入 supabase-auth）。
  const user = store.adminUsers.find(u => u.username === username);
  if (!user) return null;
  if (username === 'admin' && password) return user;
  return null;
}

// ---------------- 第三方系统对接 ----------------
export function listExternalSystems(): ExternalSystem[] {
  return store.externalSystems.map(s => ({ ...s }));
}

export function getSystemBySlug(slug: string): ExternalSystem | undefined {
  return store.externalSystems.find(s => s.slug === slug);
}

export function setSystemEnabled(slug: string, enabled: boolean): ExternalSystem | undefined {
  const sys = store.externalSystems.find(s => s.slug === slug);
  if (sys) sys.enabled = enabled;
  return sys;
}