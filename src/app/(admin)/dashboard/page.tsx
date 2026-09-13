'use client';
import { api } from '@/lib/api';
import { useApi } from '@/hooks/use-api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/admin/page-header';
import { StatCard } from '@/components/admin/stat-card';
import { LINE_TREND_CFG, PIE_CFG } from '@/components/admin/charts';
import {
  Users,
  Radio,
  MapPinCheck,
  BellRing,
  TrendingUp,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface DashboardData {
  stats: {
    rangerTotal: number;
    onlineCount: number;
    todayPatrolRate: number;
    pendingEvents: number;
    todayDistance: number;
    checkinAvgRate: number;
    weeklyTrend: { date: string; patrolCount: number; distance: number }[];
    eventTypeStats: { type: number; typeName: string; count: number }[];
  };
  warnings: { id: number; title: string; rangerName?: string; townName?: string; type: string; level: string; status: number }[];
}

export default function DashboardPage() {
  const { data, loading } = useApi<DashboardData>('/api/dashboard');

  if (loading || !data) {
    return <PageSkeleton />;
  }
  const s = data.stats;

  return (
    <div className="p-6">
      <PageHeader title="数据看板" description="全区护林员实时值守与巡护总体概览" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={<Users className="h-5 w-5" />} label="在岗护林员总数" value={String(s.rangerTotal)} />
        <StatCard icon={<Radio className="h-5 w-5" />} label="今日在线人数" value={`${s.onlineCount}/${s.rangerTotal}`} />
        <StatCard
          icon={<MapPinCheck className="h-5 w-5" />}
          label="今日巡护覆盖率"
          value={`${Math.round(s.todayPatrolRate * 100)}%`}
          tone="green"
        />
        <StatCard
          icon={<BellRing className="h-5 w-5" />}
          label="待处理事件"
          value={String(s.pendingEvents)}
          tone={s.pendingEvents > 0 ? 'orange' : 'green'}
        />
        <StatCard icon={<TrendingUp className="h-5 w-5" />} label="今日巡护里程(km)" value={String(s.todayDistance)} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">近7日巡护里程趋势</CardTitle>
          </CardHeader>
          <CardContent className="h-64">{LINE_TREND_CFG.render(s.weeklyTrend)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">事件类型分布</CardTitle>
          </CardHeader>
          <CardContent className="h-64">{PIE_CFG.render(s.eventTypeStats)}</CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">智能预警</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.warnings.length === 0 && (
              <div className="py-6 text-center text-sm text-muted-foreground">暂无预警</div>
            )}
            {data.warnings.map(w => (
              <div key={w.id} className="flex items-start justify-between gap-3 rounded-lg border p-3">
                <div className="flex items-start gap-3">
                  <WarningIcon type={w.type} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{w.title}</span>
                      {w.status === 1 ? (
                        <Badge variant="outline" className="text-green-600">已处置</Badge>
                      ) : (
                        <Badge variant="destructive">未处理</Badge>
                      )}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      {w.rangerName && `${w.rangerName} · `}
                      {w.townName}
                    </div>
                  </div>
                </div>
                <a href="/warning" className="text-xs text-primary hover:underline">
                  查看
                </a>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">今日要点</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="text-sm">
                <div className="font-medium">平均打点完成率</div>
                <div className="text-lg font-semibold tabular-nums">{s.checkinAvgRate}%</div>
              </div>
            </div>
            <div className="p-3 text-sm text-muted-foreground">
              系统已与<b>全国生态护林员联动管理系统</b>预留巡护/打点数据同步，可与省火情即报系统联动核销。
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WarningIcon({ type }: { type: string }) {
  const cls = 'h-5 w-5';
  const map: Record<string, React.ReactNode> = {
    'no-patrol': <Flame className={`${cls} text-red-500`} />,
    'event-timeout': <Flame className={`${cls} text-orange-500`} />,
    'area-not-covered': <MapPinCheck className={`${cls} text-amber-500`} />,
    'abnormal-track': <TrendingUp className={`${cls} text-yellow-500`} />,
  };
  return <>{map[type] ?? <BellRing className={`${cls} text-muted-foreground`} />}</>;
}

function PageSkeleton() {
  return (
    <div className="p-6">
      <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    </div>
  );
}