'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Building2, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Org { id: number; name: string; parentId: number; level: 1|2|3; }

const LEVEL_LABEL: Record<number, string> = { 1: '区', 2: '乡镇', 3: '村' };

export default function OrgPage() {
  const { data, loading, reload } = useApi<{ success: boolean; data: Org[] }>('/api/org');
  const [name, setName] = useState('');
  const [level, setLevel] = useState('2');
  const [parentId, setParentId] = useState(0);

  const orgs = data?.data ?? [];

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return toast.error('组织名称为必填项');
    try {
      await api('/api/org', { method: 'POST', body: { name, level: Number(level), parentId } });
      toast.success('已新增组织');
      setName(''); setParentId(0);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '新增失败');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除该组织节点？')) return;
    try {
      await api(`/api/org/${id}`, { method: 'DELETE' });
      toast.success('已删除');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  }

  const district = orgs.filter(o => o.level === 1);
  const towns = orgs.filter(o => o.level === 2);

  return (
    <div className="p-6">
      <PageHeader title="组织架构" description="区-乡镇-村三级林业组织体系" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TabularTable
            loading={loading}
            empty="暂无组织"
            columns={[
              { key: 'name', label: '组织名称', render: o => (
                <div className="flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{o.name}</span></div>
              )},
              { key: 'level', label: '层级', render: o => <Badge variant="secondary">{LEVEL_LABEL[o.level]}</Badge> },
              { key: 'parentId', label: '上级' },
              { key: 'actions', label: '操作', right: true, render: o => (
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(o.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
              )},
            ]}
            rows={orgs}
          />
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 text-sm font-medium">新增组织</h3>
          <form onSubmit={handleAdd} className="space-y-3">
            <div className="space-y-1.5"><Label>组织名称*</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="space-y-1.5">
              <Label>层级</Label>
              <select value={level} onChange={e => { setLevel(e.target.value); setParentId(0); }} className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm">
                <option value="1">区</option><option value="2">乡镇</option><option value="3">村</option>
              </select>
            </div>
            {level === '3' && (
              <div className="space-y-1.5">
                <Label>所属乡镇</Label>
                <select value={parentId} onChange={e => setParentId(Number(e.target.value))} className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm">
                  <option value={0}>选择乡镇</option>
                  {towns.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            )}
            <Button type="submit" className="w-full bg-green-600 hover:bg-green-700"><Plus className="mr-1 h-4 w-4" />新增</Button>
          </form>
        </div>
      </div>
    </div>
  );
}