'use client';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Phone, MapPin, CalendarDays } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';

interface EventItem {
  id: number;
  typeName: string;
  statusName: string;
  description: string;
  createdAt: string;
  status: number;
  type: number;
}
interface PatrolItem {
  id: number;
  startTime: string;
  distance?: number;
  duration?: number;
  status: number;
}

interface Detail {
  id: number;
  name: string;
  phoneMasked: string;
  idCard?: string;
  townName: string;
  villageName?: string;
  areaName?: string;
  hireDate?: string;
  status: number;
  online: boolean;
  monthDistance?: number;
  monthCheckinRate?: number;
  score?: number;
  area?: { name: string; boundary: never[]; keyPoints: never[] };
  patrols: PatrolItem[];
  events: EventItem[];
}

export default function RangerDetailPage() {
  const params = useParams<{ id: string }>();
  const { data, loading } = useApi<{ success: boolean; data: Detail }>(`/api/ranger/${params.id}`);
  const r = data?.data;

  if (loading || !r) {
    return <div className="p-6 text-sm text-muted-foreground">加载中…</div>;
  }

  return (
    <div className="p-6">
      <PageHeader
        title={`护林员详情 · ${r.name}`}
        description="档案与履职记录"
        actions={
          <Button asChild variant="outline"><Link href="/ranger"><ArrowLeft className="mr-1 h-4 w-4" />返回列表</Link></Button>
        }
      />
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">基础档案</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{r.name[0]}</span>
              <div>
                <div className="flex items-center gap-2 font-medium">{r.name}
                  {r.online && <Badge className="bg-green-600">在线</Badge>}
                </div>
                <span className="text-xs text-muted-foreground">{r.status === 1 ? '在岗' : '离职'}</span>
              </div>
            </div>
            <div className="space-y-2 border-t pt-3">
              <Info icon={<Phone className="h-4 w-4" />} k="手机号" v={r.phoneMasked} />
              <Info icon={<MapPin className="h-4 w-4" />} k="所属乡镇" v={`${r.townName}${r.villageName ? ` / ${r.villageName}` : ''}`} />
              <Info icon={<MapPin className="h-4 w-4" />} k="责任区域" v={r.areaName ?? '-'} />
              <Info icon={<CalendarDays className="h-4 w-4" />} k="入职日期" v={r.hireDate ?? '-'} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">本月履职</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Metric label="巡护里程" value={`${r.monthDistance ?? 0} km`} />
            <Metric label="打点完成率" value={`${r.monthCheckinRate ?? 0}%`} />
            <Metric label="综合评分" value={r.score != null ? String(r.score) : '-'} />
            <Metric label="责任区域数" value={String(r.area ? 1 : 0)} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">巡护记录</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">开始时间</th>
                    <th className="py-2 pr-4">里程(km)</th>
                    <th className="py-2 pr-4">时长(分)</th>
                    <th className="py-2">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {r.patrols.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">暂无巡护记录</td></tr>
                  )}
                  {r.patrols.map(p => (
                    <tr key={p.id} className="border-b">
                      <td className="py-2 pr-4">{new Date(p.startTime).toLocaleString()}</td>
                      <td className="py-2 pr-4 tabular-nums">{p.distance ?? 0}</td>
                      <td className="py-2 pr-4">{p.duration ? Math.round(p.duration / 60) : '-'}</td>
                      <td className="py-2">
                        <Badge variant={p.status === 1 ? 'default' : p.status === 2 ? 'destructive' : 'secondary'}>
                          {p.status === 1 ? '已完成' : p.status === 2 ? '异常' : '进行中'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader><CardTitle className="text-base">事件上报记录</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">时间</th>
                    <th className="py-2 pr-4">类型</th>
                    <th className="py-2 pr-4">描述</th>
                    <th className="py-2">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {r.events.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-muted-foreground">暂无事件记录</td></tr>
                  )}
                  {r.events.map(e => (
                    <tr key={e.id} className="border-b">
                      <td className="py-2 pr-4">{new Date(e.createdAt).toLocaleString()}</td>
                      <td className="py-2 pr-4"><TypeBadge type={e.type} name={e.typeName} /></td>
                      <td className="py-2 pr-4 max-w-xs truncate">{e.description}</td>
                      <td className="py-2">
                        <Badge variant={e.status === 2 ? 'default' : e.status === 0 ? 'destructive' : 'secondary'}>
                          {e.statusName}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function TypeBadge({ type, name }: { type: number; name: string }) {
  const color = type === 1 ? 'bg-red-100 text-red-700' : type === 2 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700';
  return <span className={`rounded px-2 py-0.5 text-xs font-medium ${color}`}>{name}</span>;
}

function Info({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      {icon}
      <span className="w-20 shrink-0">{k}</span>
      <span className="text-foreground">{v}</span>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/40 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}