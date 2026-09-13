'use client';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BAR_CFG, PIE_CFG } from '@/components/admin/charts';
import { PageHeader } from '@/components/admin/page-header';
import { Flame, Clock, CheckCircle2 } from 'lucide-react';

interface StatResp {
  success: boolean; data: {
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    total: number;
    timeoutEvents: number;
  };
}

export default function EventStatsPage() {
  const { data, loading } = useApi<StatResp>('/api/event/stats');
  const d = data?.data;
  const pieData = d ? Object.entries(d.byType).map(([typeName, count]) => ({ typeName, count })) : [];
  const barData = d ? Object.entries(d.byStatus).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="p-6">
      <PageHeader title="事件统计" description="事件状态与类型分布分析" />
      <div className="mb-4 grid gap-4 sm:grid-cols-3">
        <MiniCard icon={<Flame className="h-5 w-5 text-orange-600" />} label="事件总量" value={String(d?.total ?? '-')} />
        <MiniCard icon={<Clock className="h-5 w-5 text-red-600" />} label="超时未处理(>2h)" value={String(d?.timeoutEvents ?? '-')} />
        <MiniCard icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} label="已闭环" value={String(d?.byStatus?.['已闭环'] ?? 0)} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">事件类型分布</CardTitle></CardHeader>
          <CardContent className="h-64">{loading ? <Loading /> : PIE_CFG.render(pieData)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">状态统计</CardTitle></CardHeader>
          <CardContent className="h-64">{loading ? <Loading /> : BAR_CFG.render(barData)}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function MiniCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Card><CardContent className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">{icon}</div>
      <div><div className="text-xs text-muted-foreground">{label}</div><div className="text-xl font-semibold tabular-nums">{value}</div></div>
    </CardContent></Card>
  );
}
function Loading() {
  return <div className="flex h-full items-center justify-center text-sm text-muted-foreground">加载中…</div>;
}