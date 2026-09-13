'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TabularTable,
} from '@/components/admin/data-table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

interface WarningItem {
  id: number; type: string; title: string; rangerName?: string; townName?: string;
  detail: string; level: 'high'|'medium'|'low'; status: number; createdAt: string;
}

const TYPE_MAP: Record<string, string> = {
  'no-patrol': '连续未巡护', 'abnormal-track': '轨迹异常',
  'area-not-covered': '重点区域未覆盖', 'event-timeout': '事件超时未处理',
};

export default function WarningPage() {
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const { data, loading, reload } = useApi<{ success: boolean; data: WarningItem[] }>(
    `/api/warning?type=${type}&status=${status}`,
  );

  const list = data?.data ?? [];

  async function handleResolve(w: WarningItem) {
    try {
      await api('/api/warning', { method: 'PUT', body: { id: w.id, status: w.status === 1 ? 0 : 1 } });
      toast.success(w.status === 1 ? '已恢复未处置' : '已标记处置');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="智能预警" description="基于巡护、打点、事件规则的自动预警" />
      <div className="mb-4 flex gap-2">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-44"><SelectValue placeholder="预警类型" /></SelectTrigger>
          <SelectContent>
            {Object.entries(TYPE_MAP).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="处置状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">未处理</SelectItem>
            <SelectItem value="1">已处置</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无预警"
        columns={[
          { key: 'title', label: '预警内容', render: w => (
            <div>
              <div className="flex items-center gap-2 font-medium">{w.title}
                {w.status === 0 ? <Badge variant="destructive">未处理</Badge> : <Badge className="bg-green-600">已处置</Badge>}
                <LevelBadge level={w.level} />
              </div>
              <div className="text-xs text-muted-foreground">
                {TYPE_MAP[w.type] ?? w.type}{w.rangerName ? ` · ${w.rangerName}` : ''}{w.townName ? ` · ${w.townName}` : ''}
              </div>
            </div>
          )},
          { key: 'detail', label: '详情' },
          { key: 'time', label: '时间', render: w => <span className="text-muted-foreground">{new Date(w.createdAt).toLocaleString()}</span> },
          { key: 'actions', label: '操作', right: true, render: w => (
            <Button variant="outline" size="sm" onClick={() => handleResolve(w)}>
              {w.status === 1 ? '标记未处理' : '标记处置'}
            </Button>
          )},
        ]}
        rows={list}
      />
    </div>
  );
}

function LevelBadge({ level }: { level: string }) {
  const map: Record<string, { cls: string; text: string }> = {
    high: { cls: 'bg-red-100 text-red-700', text: '高' },
    medium: { cls: 'bg-amber-100 text-amber-700', text: '中' },
    low: { cls: 'bg-slate-100 text-slate-700', text: '低' },
  };
  const m = map[level] ?? map.low;
  return <span className={`rounded px-1.5 py-0.5 text-xs ${m.cls}`}>{m.text}风险</span>;
}