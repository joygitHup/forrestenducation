'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Result {
  id: number; rangerName?: string; townName?: string; patrolScore: number; eventScore: number;
  studyScore: number; totalScore: number; rankInTown?: number; level: string;
}
interface Resp {
  success: boolean; data: { year: number; month: number; total: number; list: Result[] };
}

export default function AssessmentPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, loading, reload } = useApi<Resp>(`/api/assessment?year=${year}&month=${month}`);

  const list = data?.data.list ?? [];

  async function handleRecompute() {
    toast.loading('正在重新计算考核结果…');
    try {
      await api('/api/assessment', { method: 'POST', body: { year, month } });
      toast.success('考核结果已重算');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '重算失败');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="考核结果"
        description={`${year}年${month}月护林员月度考核`}
        actions={<Button variant="outline" onClick={handleRecompute}><RefreshCw className="mr-1 h-4 w-4" />手动重算</Button>}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-28" />
        <Input type="number" value={month} min={1} max={12} onChange={e => setMonth(Number(e.target.value))} className="w-24" />
        <span className="text-sm text-muted-foreground">共 {data?.data.total ?? 0} 条</span>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无考核结果，请点击手动重算"
        columns={[
          { key: 'rangerName', label: '护林员', render: r => <span className="font-medium">{r.rangerName ?? '-'}</span> },
          { key: 'townName', label: '乡镇' },
          { key: 'patrolScore', label: '巡护得分', render: r => <Score v={r.patrolScore} /> },
          { key: 'eventScore', label: '上报得分', render: r => <Score v={r.eventScore} /> },
          { key: 'studyScore', label: '培训得分', render: r => <Score v={r.studyScore} /> },
          { key: 'totalScore', label: '总分', render: r => <span className="text-base font-semibold tabular-nums">{r.totalScore}</span> },
          { key: 'level', label: '等级', render: r => <Badge variant={r.level === '优秀' ? 'default' : r.level === '不合格' ? 'destructive' : 'secondary'}>{r.level}</Badge> },
          { key: 'rankInTown', label: '乡镇排名', render: r => r.rankInTown ? `第${r.rankInTown}名` : '-' },
        ]}
        rows={list}
      />
    </div>
  );
}

function Score({ v }: { v: number }) {
  return <span className="tabular-nums">{v}</span>;
}