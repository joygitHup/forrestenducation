'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { OrgNode, OrgWritePayload } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { MSG, notify } from '@/lib/feedback';
import { deleteConfirm, useConfirm } from '@/components/feedback/confirm-provider';

const LEVEL_LABEL: Record<1 | 2 | 3, string> = { 1: '区', 2: '乡镇', 3: '村' };

function buildOrgQuery(keyword: string, level: string) {
  const q = new URLSearchParams();
  if (keyword.trim()) q.set('keyword', keyword.trim());
  if (level !== 'all') q.set('level', level);
  const qs = q.toString();
  return qs ? `/api/org?${qs}` : '/api/org';
}

export default function OrgPage() {
  const confirm = useConfirm();
  const [keyword, setKeyword] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const { data, loading, reload } = useApi<{ success: boolean; data: OrgNode[] }>(
    buildOrgQuery(keyword, levelFilter),
  );
  const districtOptions = useApi<{ success: boolean; data: OrgNode[] }>('/api/org?level=1');
  const townOptions = useApi<{ success: boolean; data: { id: number; name: string }[] }>('/api/org?kind=town');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('2');
  const [parentId, setParentId] = useState(0);

  const orgs = data?.data ?? [];
  const districts = districtOptions.data?.data ?? [];
  const towns = townOptions.data?.data ?? [];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      notify.warning('组织名称为必填项');
      return;
    }
    if (level === '2' && !parentId) {
      notify.warning('乡镇必须选择所属区');
      return;
    }
    if (level === '3' && !parentId) {
      notify.warning('村必须选择所属乡镇');
      return;
    }
    const payload: OrgWritePayload = {
      name: name.trim(),
      level: Number(level) as 1 | 2 | 3,
      parentId: level === '1' ? 0 : parentId,
    };
    try {
      await api('/api/org', { method: 'POST', body: payload });
      notify.success(MSG.created);
      setName('');
      setParentId(0);
      reload();
    } catch (err) {
      notify.error(err, '新增失败');
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm(deleteConfirm('该组织节点'));
    if (!ok) return;
    try {
      await api(`/api/org/${id}`, { method: 'DELETE' });
      notify.success(MSG.deleted);
      reload();
    } catch (err) {
      notify.error(err, '删除失败');
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="组织架构" description="区-乡镇-村三级林业组织体系" />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索组织名称"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={levelFilter} onValueChange={setLevelFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="层级" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部层级</SelectItem>
            <SelectItem value="1">区</SelectItem>
            <SelectItem value="2">乡镇</SelectItem>
            <SelectItem value="3">村</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TabularTable
            loading={loading}
            empty="暂无组织"
            columns={[
              { key: 'name', label: '组织名称', render: o => (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{o.name}</span>
                </div>
              )},
              { key: 'level', label: '层级', render: o => <Badge variant="secondary">{o.levelName ?? LEVEL_LABEL[o.level]}</Badge> },
              { key: 'parentName', label: '上级', render: o => o.parentName ?? '-' },
              { key: 'actions', label: '操作', right: true, render: o => (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(o.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )},
            ]}
            rows={orgs}
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">新增组织</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5">
              <Label>组织名称*</Label>
              <Input value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>层级</Label>
              <Select value={level} onValueChange={v => { setLevel(v); setParentId(0); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">区</SelectItem>
                  <SelectItem value="2">乡镇</SelectItem>
                  <SelectItem value="3">村</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {level === '2' && (
              <div className="space-y-1.5">
                <Label>所属区*</Label>
                <Select value={parentId ? String(parentId) : undefined} onValueChange={v => setParentId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="选择区" /></SelectTrigger>
                  <SelectContent>
                    {districts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            {level === '3' && (
              <div className="space-y-1.5">
                <Label>所属乡镇*</Label>
                <Select value={parentId ? String(parentId) : undefined} onValueChange={v => setParentId(Number(v))}>
                  <SelectTrigger><SelectValue placeholder="选择乡镇" /></SelectTrigger>
                  <SelectContent>
                    {towns.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">
              <Plus className="mr-1 h-4 w-4" />新增
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
