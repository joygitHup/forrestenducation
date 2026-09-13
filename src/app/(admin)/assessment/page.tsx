'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { AssessmentListData, AssessmentRecomputePayload } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { RefreshCw } from 'lucide-react';
import { MSG, notify } from '@/lib/feedback';
import { useConfirm } from '@/components/feedback/confirm-provider';

interface TownOption { id: number; name: string }

function buildAssessmentQuery(year: number, month: number, townId: string, keyword: string) {
  const q = new URLSearchParams();
  q.set('year', String(year));
  q.set('month', String(month));
  if (townId !== 'all') q.set('townId', townId);
  if (keyword.trim()) q.set('keyword', keyword.trim());
  return `/api/assessment?${q.toString()}`;
}

export default function AssessmentPage() {
  const confirm = useConfirm();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(9);
  const [townId, setTownId] = useState('all');
  const [keyword, setKeyword] = useState('');
  const { data, loading, reload } = useApi<{ success: boolean; data: AssessmentListData }>(
    buildAssessmentQuery(year, month, townId, keyword),
  );
  const towns = useApi<{ success: boolean; data: TownOption[] }>('/api/org?kind=town');

  const list = data?.data.list ?? [];
  const total = data?.data.total ?? 0;

  async function handleRecompute() {
    const payload: AssessmentRecomputePayload = { year, month };
    const toastId = toast.loading('正在重新计算考核结果…');
    try {
      await api('/api/assessment', { method: 'POST', body: payload });
      toast.success('考核结果已重算', { id: toastId });
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '重算失败', { id: toastId });
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
        <Input
          placeholder="搜索护林员"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={townId} onValueChange={setTownId}>
          <SelectTrigger className="w-40"><SelectValue placeholder="所属乡镇" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部乡镇</SelectItem>
            {(towns.data?.data ?? []).map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">共 {total} 条</span>
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
          { key: 'level', label: '等级', render: r => (
            <Badge variant={r.level === '优秀' ? 'default' : r.level === '不合格' ? 'destructive' : 'secondary'}>
              {r.level ?? '-'}
            </Badge>
          ) },
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
