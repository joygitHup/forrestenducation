// 考核管理服务

import { store, nextId } from '@/data/memoryDB';
import { AssessmentRule, AssessmentResult } from '@/types';
import { townNameOf } from './utils';

export interface AssessmentQuery {
  year?: number;
  month?: number;
  townId?: number;
  page?: number;
  size?: number;
}

export function listAssessments(query: AssessmentQuery = {}) {
  const page = query.page ?? 1;
  const size = query.size ?? 20;
  const year = query.year ?? new Date().getFullYear();
  const month = query.month ?? new Date().getMonth() + 1;
  let list = store.assessments.filter(a => a.year === year && a.month === month);
  if (query.townId) list = list.filter(a => a.townId === query.townId);
  const orgs = store.orgs;
  const data = list.map(a => ({
    ...a,
    townName: townNameOf(orgs, a.townId),
    level: scoreLevel(a.totalScore),
  }));
  return {
    year,
    month,
    total: data.length,
    list: data.slice((page - 1) * size, page * size),
    page,
    size,
  };
}

export function scoreLevel(score: number): '优秀' | '良好' | '合格' | '不合格' {
  if (score >= 85) return '优秀';
  if (score >= 70) return '良好';
  if (score >= 60) return '合格';
  return '不合格';
}

export function getRules(): AssessmentRule[] {
  return [...store.rules].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export interface RuleInput {
  name: string;
  patrolWeight: number;
  eventWeight: number;
  studyWeight: number;
  patrolTarget?: number;
  checkinTarget?: number;
  effectiveDate?: string;
}

export function saveRule(input: RuleInput): AssessmentRule {
  const existing = store.rules[0];
  if (existing) {
    store.rules[0] = { ...existing, ...input };
    return store.rules[0];
  }
  const rule: AssessmentRule = { id: nextId(), ...input, createdAt: new Date().toISOString() };
  store.rules.push(rule);
  return rule;
}

// 手动触发当月考核计算（对应定时任务的同步入口）
export function recomputeAssessments(year: number, month: number): number {
  const active = store.rangers.filter(r => r.status === 1);
  const townOf = (townId: number) => townId;
  let computed = 0;
  active.forEach(r => {
    const patrolTotal = store.patrols
      .filter(p => p.rangerId === r.id)
      .reduce((s, p) => s + (p.distance ?? 0), 0);
    const patrolScore = Math.min(patrolTotal / 100, 1) * 40;
    const validEvents = store.events.filter(e => e.rangerId === r.id && e.status === 2).length;
    const eventScore = Math.min(validEvents * 10, 30);
    const studyScore = 0; // 简化：可读学习进度
    const totalScore = Math.round((patrolScore + eventScore + studyScore) * 100) / 100;

    const townId = townOf(r.townId);
    const townResults = active
      .filter(x => x.townId === townId)
      .map(x => {
        const pd = store.patrols.filter(p => p.rangerId === x.id).reduce((s, p) => s + (p.distance ?? 0), 0);
        const ev = store.events.filter(e => e.rangerId === x.id && e.status === 2).length;
        return { id: x.id, score: Math.round((Math.min(pd / 100, 1) * 40 + Math.min(ev * 10, 30)) * 100) / 100 };
      })
      .sort((a, b) => b.score - a.score);
    const rank = townResults.findIndex(x => x.id === r.id) + 1;

    const existingIdx = store.assessments.findIndex(a => a.rangerId === r.id && a.year === year && a.month === month);
    const result: AssessmentResult = {
      id: existingIdx >= 0 ? store.assessments[existingIdx].id : nextId(),
      rangerId: r.id,
      rangerName: r.name,
      townId: r.townId,
      year,
      month,
      patrolScore: Number(patrolScore.toFixed(2)),
      eventScore: Number(eventScore.toFixed(2)),
      studyScore: Number(studyScore.toFixed(2)),
      totalScore: Number(totalScore.toFixed(2)),
      rankInTown: rank,
      createdAt: new Date().toISOString(),
    };
    if (existingIdx >= 0) store.assessments[existingIdx] = result;
    else store.assessments.push(result);
    computed++;
  });
  return computed;
}