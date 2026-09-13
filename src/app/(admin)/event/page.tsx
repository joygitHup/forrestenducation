'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Textarea,
} from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

interface EventItem {
  id: number; rangerName?: string; townName?: string; typeName: string; type: number;
  description: string; status: number; statusName: string; address?: string; createdAt: string;
}
interface ListResp {
  success: boolean; data: { total: number; list: EventItem[] };
}

const TYPE_LABEL: Record<number, string> = { 1: '火情', 2: '隐患', 3: '破坏森林资源', 4: '其他' };

export default function EventPage() {
  const [status, setStatus] = useState('');
  const [handleEvent, setHandleEvent] = useState<EventItem | null>(null);
  const [note, setNote] = useState('');
  const [nextStatus, setNextStatus] = useState('2');
  const { data, loading, reload } = useApi<ListResp>(`/api/event?status=${status}`);

  const list = data?.data.list ?? [];

  async function submitHandle() {
    if (!handleEvent) return;
    try {
      await api(`/api/event/${handleEvent.id}`, { method: 'PUT', body: { status: Number(nextStatus), note, handlerName: '区防火办' } });
      toast.success('事件已处理');
      setHandleEvent(null);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '处理失败');
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="事件列表" description="护林员上报事件的处置闭环管理" />
      <div className="mb-4">
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-40"><SelectValue placeholder="处理状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">待处理</SelectItem>
            <SelectItem value="1">处理中</SelectItem>
            <SelectItem value="2">已闭环</SelectItem>
            <SelectItem value="3">已驳回</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无事件"
        columns={[
          { key: 'id', label: 'ID' },
          { key: 'typeName', label: '类型', render: e => <TypeBadge type={e.type} name={e.typeName} /> },
          { key: 'description', label: '描述', render: e => <span className="max-w-xs truncate">{e.description}</span> },
          { key: 'townName', label: '乡镇' },
          { key: 'rangerName', label: '上报人', render: e => e.rangerName ?? '-' },
          { key: 'time', label: '上报时间', render: e => <span className="text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</span> },
          { key: 'status', label: '状态', render: e => <StatusBadge status={e.status} name={e.statusName} /> },
          { key: 'actions', label: '操作', right: true, render: e => (
            e.status !== 2 && e.status !== 3 ? (
              <Button variant="outline" size="sm" onClick={() => { setHandleEvent(e); setNote(''); setNextStatus('2'); }}>处理</Button>
            ) : <span className="text-muted-foreground">—</span>
          )},
        ]}
        rows={list}
      />

      <Dialog open={!!handleEvent} onOpenChange={o => !o && setHandleEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>处理事件 #{handleEvent?.id}</DialogTitle>
            <DialogDescription>{handleEvent?.typeName} · {handleEvent?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>处理结果</Label>
              <Select value={nextStatus} onValueChange={setNextStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">处理中</SelectItem>
                  <SelectItem value="2">已闭环</SelectItem>
                  <SelectItem value="3">驳回</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>处理反馈</Label><Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="填写处置说明" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHandleEvent(null)}>取消</Button>
            <Button onClick={submitHandle} className="bg-green-600 hover:bg-green-700">提交处理</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TypeBadge({ type, name }: { type: number; name: string }) {
  const cls = type === 1 ? 'bg-red-100 text-red-700' : type === 2 ? 'bg-amber-100 text-amber-700' : type === 3 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${cls}`}>{name}</span>;
}
function StatusBadge({ status, name }: { status: number; name: string }) {
  const map: Record<number, 'default'|'secondary'|'destructive'|'outline'> = { 0: 'destructive', 1: 'secondary', 2: 'default', 3: 'outline' };
  return <Badge variant={map[status] ?? 'secondary'}>{name}</Badge>;
}

// re-export for potential use
export function eventTypeOptions() {
  return Object.entries(TYPE_LABEL).map(([v, k]) => ({ value: v, label: k }));
}