'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useApi, useApiMutate } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Pencil, Plus, Trash2, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

interface AreaOption { id: number; name: string; townId: number; rangerName?: string }
interface TownOption { id: number; name: string }

interface RangerRow {
  id: number;
  name: string;
  phoneMasked: string;
  townName: string;
  villageName?: string;
  areaName?: string;
  monthDistance?: number;
  monthCheckinRate?: number;
  score?: number;
  status: number;
  online: boolean;
}

interface ListResp {
  success: boolean;
  data: { total: number; list: RangerRow[]; page: number; size: number };
}

const emptyForm = {
  name: '',
  phone: '',
  idCard: '',
  townId: 0,
  villageId: 0,
  areaId: 0,
  hireDate: '',
  status: 1,
};

export default function RangerPage() {
  const [keyword, setKeyword] = useState('');
  const [townId, setTownId] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<number | null>(null);

  const query = `/api/ranger?keyword=${keyword}&townId=${townId}&status=${status}&page=${page}&size=20`;
  const { data, loading, reload } = useApi<ListResp>(query);
  const towns = useApi<{ success: boolean; data: TownOption[] }>('/api/org?kind=town');
  const areas = useApi<{ success: boolean; data: AreaOption[] }>('/api/area');
  const { mutate: save } = useApiMutate('/api/ranger');

  const list = data?.data.list ?? [];
  const total = data?.data.total ?? 0;
  const areaOptions = areas.data?.data ?? [];
  const townVal = form.townId ? String(form.townId) : '';

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.phone || !form.townId) {
      toast.error('姓名、手机号、乡镇为必填项');
      return;
    }
    try {
      if (editing) {
        await api(`/api/ranger/${editing}`, { method: 'PUT', body: form });
        toast.success('已更新');
      } else {
        await save('POST', form);
        toast.success('已创建');
      }
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('确定删除该护林员？')) return;
    try {
      await api(`/api/ranger/${id}`, { method: 'DELETE' });
      toast.success('已删除');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '删除失败');
    }
  }

  function openEdit(r?: RangerRow) {
    if (!r) {
      setForm(emptyForm);
      setEditing(null);
    } else {
      setForm({
        name: r.name,
        phone: r.phoneMasked.replace('****', ''),
        idCard: '',
        townId: r.townName ? towns.data?.data.find(t => t.name === r.townName)?.id ?? 0 : 0,
        villageId: 0,
        areaId: 0,
        hireDate: '',
        status: r.status,
      });
      setEditing(r.id);
    }
    setOpen(true);
  }

  return (
    <div className="p-6">
      <PageHeader
        title="护林员列表"
        description="管理护林员档案，实时查看巡护履职情况"
        actions={
          <Button onClick={() => openEdit()}><Plus className="mr-1 h-4 w-4" />新增护林员</Button>
        }
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索姓名/手机号"
          value={keyword}
          onChange={e => { setKeyword(e.target.value); setPage(1); }}
          className="max-w-xs"
        />
        <Select value={townId} onValueChange={v => { setTownId(v); setPage(1); }}>
          <SelectTrigger className="w-40"><SelectValue placeholder="所属乡镇" /></SelectTrigger>
          <SelectContent>
            {towns.data?.data.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-32"><SelectValue placeholder="在职状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="1">在岗</SelectItem>
            <SelectItem value="0">离职</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>姓名</TableHead>
              <TableHead>手机号</TableHead>
              <TableHead>所属乡镇/村</TableHead>
              <TableHead>责任区域</TableHead>
              <TableHead>本月里程</TableHead>
              <TableHead>打点率</TableHead>
              <TableHead>评分</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">加载中…</TableCell></TableRow>
            )}
            {!loading && list.length === 0 && (
              <TableRow><TableCell colSpan={9} className="py-10 text-center text-muted-foreground">暂无护林员</TableCell></TableRow>
            )}
            {list.map(r => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.name}</span>
                    {r.online && <Badge variant="default" className="bg-green-600">在线</Badge>}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{r.phoneMasked}</TableCell>
                <TableCell>{r.townName}{r.villageName ? ` / ${r.villageName}` : ''}</TableCell>
                <TableCell>{r.areaName ?? '-'}</TableCell>
                <TableCell className="tabular-nums">{r.monthDistance ?? 0} km</TableCell>
                <TableCell className="tabular-nums">{r.monthCheckinRate ?? 0}%</TableCell>
                <TableCell>
                  <ScoreBadge score={r.score ?? 0} />
                </TableCell>
                <TableCell>
                  <Badge variant={r.status === 1 ? 'default' : 'secondary'}>
                    {r.status === 1 ? '在岗' : '离职'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button asChild variant="ghost" size="sm"><Link href={`/ranger/${r.id}`}><Pencil className="h-3.5 w-3.5" /></Link></Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between border-t px-4 py-3">
          <span className="text-sm text-muted-foreground">共 {total} 条</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
            <span className="text-sm">第 {page} 页</span>
            <Button variant="outline" size="sm" disabled={page * 20 >= total} onClick={() => setPage(p => p + 1)}>下一页</Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑护林员' : '新增护林员'}</DialogTitle>
            <DialogDescription>填写护林员档案信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField label="姓名*"><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></FormField>
              <FormField label="手机号*"><Input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></FormField>
              <FormField label="身份证号"><Input value={form.idCard} onChange={e => setForm({ ...form, idCard: e.target.value })} /></FormField>
              <FormField label="入职日期"><Input type="date" value={form.hireDate} onChange={e => setForm({ ...form, hireDate: e.target.value })} /></FormField>
              <FormField label="所属乡镇*">
                <Select value={townVal} onValueChange={v => setForm({ ...form, townId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="选择乡镇" /></SelectTrigger>
                  <SelectContent>
                    {towns.data?.data.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="责任区域">
                <Select value={form.areaId ? String(form.areaId) : ''} onValueChange={v => setForm({ ...form, areaId: Number(v) })}>
                  <SelectTrigger><SelectValue placeholder="选择区域" /></SelectTrigger>
                  <SelectContent>
                    {areaOptions.map(a => <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </FormField>
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  if (score >= 85) return <Badge variant="default" className="bg-green-600">{score}</Badge>;
  if (score >= 70) return <Badge variant="secondary">{score}</Badge>;
  if (score > 0) return <Badge variant="destructive" className="bg-orange-600">{score}</Badge>;
  return <span className="text-muted-foreground">-</span>;
}