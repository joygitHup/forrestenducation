'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { AreaWritePayload, KeyPoint, ResponsibilityArea } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { MSG, notify } from '@/lib/feedback';
import { deleteConfirm, useConfirm } from '@/components/feedback/confirm-provider';

interface TownOption { id: number; name: string }

function buildAreaQuery(keyword: string, townId: string) {
  const q = new URLSearchParams();
  if (keyword.trim()) q.set('keyword', keyword.trim());
  if (townId !== 'all') q.set('townId', townId);
  const qs = q.toString();
  return qs ? `/api/area?${qs}` : '/api/area';
}

function parseKeyPoints(text: string): KeyPoint[] {
  return text
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const [name, lng, lat, radius] = item.split(',').map(part => part.trim());
      return {
        name,
        lng: Number(lng),
        lat: Number(lat),
        radius: Number(radius || 100),
      };
    });
}

function formatKeyPoints(points: KeyPoint[]) {
  return points.map(k => `${k.name},${k.lng},${k.lat},${k.radius}`).join('; ');
}

const emptyForm = { name: '', townId: 0, areaSize: '', keyPointsText: '' };

export default function AreaPage() {
  const confirm = useConfirm();
  const [keyword, setKeyword] = useState('');
  const [townId, setTownId] = useState('all');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data, loading, reload } = useApi<{ success: boolean; data: ResponsibilityArea[] }>(
    buildAreaQuery(keyword, townId),
  );
  const towns = useApi<{ success: boolean; data: TownOption[] }>('/api/org?kind=town');

  const list = data?.data ?? [];
  const townOptions = towns.data?.data ?? [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.townId) {
      notify.warning('区域名称与乡镇为必填项');
      return;
    }
    const keyPoints = parseKeyPoints(form.keyPointsText);
    if (form.keyPointsText.trim() && keyPoints.some(k => !k.name || Number.isNaN(k.lng) || Number.isNaN(k.lat))) {
      notify.warning('打点格式不正确');
      return;
    }
    const payload: AreaWritePayload = {
      name: form.name.trim(),
      townId: form.townId,
      areaSize: form.areaSize ? Number(form.areaSize) : null,
      keyPoints,
    };
    try {
      if (editing) {
        await api(`/api/area/${editing}`, { method: 'PUT', body: payload });
        notify.success(MSG.updated);
      } else {
        await api('/api/area', { method: 'POST', body: payload });
        notify.success(MSG.created);
      }
      setOpen(false);
      reload();
    } catch (err) {
      notify.error(err, '保存失败');
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setOpen(true);
  }

  function openEdit(a: ResponsibilityArea) {
    setForm({
      name: a.name,
      townId: a.townId,
      areaSize: a.areaSize != null ? String(a.areaSize) : '',
      keyPointsText: formatKeyPoints(a.keyPoints ?? []),
    });
    setEditing(a.id);
    setOpen(true);
  }

  async function handleDelete(id: number) {
    const ok = await confirm(deleteConfirm('该区域'));
    if (!ok) return;
    try {
      await api(`/api/area/${id}`, { method: 'DELETE' });
      notify.success(MSG.deleted);
      reload();
    } catch (err) {
      notify.error(err, '删除失败（可能被护林员引用）');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="责任区域管理"
        description="重点区域边界、打点与责任护林员配置"
        actions={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新增区域</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索区域/乡镇"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={townId} onValueChange={setTownId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="所属乡镇" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部乡镇</SelectItem>
            {townOptions.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>区域名称</TableHead>
              <TableHead>所属乡镇</TableHead>
              <TableHead>面积(km²)</TableHead>
              <TableHead>打点数量</TableHead>
              <TableHead>责任护林员</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">加载中…</TableCell></TableRow>}
            {!loading && list.length === 0 && <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">暂无区域</TableCell></TableRow>}
            {list.map(a => (
              <TableRow key={a.id}>
                <TableCell className="font-medium">{a.name}</TableCell>
                <TableCell>{a.townName ?? '-'}</TableCell>
                <TableCell className="tabular-nums">{a.areaSize ?? '-'}</TableCell>
                <TableCell><Badge variant="secondary">{(a.keyPoints ?? []).length} 个</Badge></TableCell>
                <TableCell>{a.rangerName || '未分配'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑责任区域' : '新增责任区域'}</DialogTitle>
            <DialogDescription>设置区域边界与重点打点</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>区域名称*</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>所属乡镇*</Label>
                <Select
                  value={form.townId ? String(form.townId) : undefined}
                  onValueChange={v => setForm({ ...form, townId: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="选择乡镇" /></SelectTrigger>
                  <SelectContent>
                    {townOptions.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>面积(km²)</Label>
                <Input type="number" value={form.areaSize} onChange={e => setForm({ ...form, areaSize: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>重点打点（用 ; 分隔，格式：名称,lng,lat,半径米）</Label>
              <Input
                placeholder={'东坪瞭望塔,106.72,31.835,200; 水库大坝,106.8,31.8,150'}
                value={form.keyPointsText}
                onChange={e => setForm({ ...form, keyPointsText: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>取消</Button>
              <Button type="submit" className="bg-green-600 hover:bg-green-700">保存</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
