'use client';
import { useState } from 'react';
import { useApi, useApiMutate } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

interface Area {
  id: number; name: string; townId: number; townName?: string;
  areaSize?: number; rangerName?: string;
  keyPoints: { name: string; lng: number; lat: number; radius: number }[];
}
interface Town { id: number; name: string }

export default function AreaPage() {
  const { data, loading, reload } = useApi<{ success: boolean; data: Area[] }>('/api/area');
  const towns = useApi<{ success: boolean; data: Town[] }>('/api/org?kind=town');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', townId: 0, areaSize: '', keyPointsText: '' });

  const list = data?.data ?? [];
  const townOptions = towns.data?.data ?? [];
  const townVal = form.townId ? String(form.townId) : '';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.townId) return toast.error('区域名称与乡镇为必填项');
    const keyPoints = form.keyPointsText
      ? form.keyPointsText.split(';').filter(Boolean).map(k => {
          const [name, lng, lat, radius] = k.split(',');
          return { name: name.trim(), lng: Number(lng), lat: Number(lat), radius: Number(radius || 100) };
        })
      : [];
    const body = { name: form.name, townId: Number(form.townId), areaSize: form.areaSize ? Number(form.areaSize) : undefined, keyPoints };
    try {
      if (editing) {
        await api(`/api/area/${editing}`, { method: 'PUT', body });
        toast.success('已更新');
      } else {
        await api('/api/area', { method: 'POST', body });
        toast.success('已创建');
      }
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  }

  function openEdit(a?: Area) {
    if (!a) {
      setForm({ name: '', townId: 0, areaSize: '', keyPointsText: '' });
      setEditing(null);
    } else {
      setForm({
        name: a.name,
        townId: a.townId,
        areaSize: a.areaSize ? String(a.areaSize) : '',
        keyPointsText: a.keyPoints.map(k => `${k.name},${k.lng},${k.lat},${k.radius}`).join(';'),
      });
      setEditing(a.id);
    }
    setOpen(true);
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除该区域？')) return;
    try {
      await api(`/api/area/${id}`, { method: 'DELETE' });
      toast.success('已删除');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败（可能被护林员引用）');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="责任区域管理"
        description="重点区域边界、打点与责任护林员配置"
        actions={<Button onClick={() => openEdit()}><Plus className="mr-1 h-4 w-4" />新增区域</Button>}
      />
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>区域名称</TableHead><TableHead>所属乡镇</TableHead><TableHead>面积(km²)</TableHead>
              <TableHead>打点数量</TableHead><TableHead>责任护林员</TableHead><TableHead className="text-right">操作</TableHead>
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
                <TableCell><Badge variant="secondary">{a.keyPoints.length} 个</Badge></TableCell>
                <TableCell>{a.rangerName ?? '未分配'}</TableCell>
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
            <div className="space-y-1.5"><Label>区域名称*</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>所属乡镇*</Label>
                <select value={townVal} onChange={e => setForm({ ...form, townId: Number(e.target.value) })} className="flex h-9 w-full rounded-md border bg-transparent px-3 text-sm">
                  <option value="">选择乡镇</option>
                  {townOptions.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5"><Label>面积(km²)</Label><Input type="number" value={form.areaSize} onChange={e => setForm({ ...form, areaSize: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>重点打点（用 ; 分隔，格式：名称,lng,lat,半径米）</Label>
              <Input placeholder={'东坪瞭望塔,106.72,31.835,200; 水库大坝,106.8,31.8,150'} value={form.keyPointsText} onChange={e => setForm({ ...form, keyPointsText: e.target.value })} />
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