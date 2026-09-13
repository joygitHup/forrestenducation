'use client';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { Link2, Send, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

interface System {
  id: number; slug: string; name: string; category: 'treasury'|'province'|'city'|'advice';
  priority: 'p0'|'p1'|'p2'; baseUrl?: string; authType: 'none'|'token'|'oauth'|'sign';
  enabled: boolean; direction: 'in'|'out'|'bidirectional'; desc: string;
  endpoints: string[]; hasAdapter?: boolean;
}

const CATEGORY_LABEL: Record<string, string> = {
  treasury: '已建成本地系统', province: '省级政务数据平台', city: '组织体系协同', advice: '建议接入',
};
const PRIORITY_LABEL: Record<string, string> = { p0: 'P0·必须对接', p1: 'P1·建议对接', p2: 'P2·视需要' };
const DIRECTION_LABEL: Record<string, string> = { in: '数据接入', out: '数据推送', bidirectional: '双向' };

export default function IntegrationPage() {
  const { data, loading, reload } = useApi<{ success: boolean; data: System[] }>('/api/external/systems');
  const systems = data?.data ?? [];

  async function toggle(sys: System, enabled: boolean) {
    try {
      await api('/api/external/systems', { method: 'PUT', body: { slug: sys.slug, enabled } });
      toast.success(enabled ? `已启用：${sys.name}` : `已停用：${sys.name}`);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '操作失败');
    }
  }

  async function testConnect(sys: System) {
    const toastId = toast.loading(`正在向「${sys.name}」推送测试数据…`);
    try {
      const res = await api<{ success: boolean; msg?: string }>('/api/external/integrate', {
        method: 'POST',
        body: { system: sys.slug, action: 'push', payload: { eventId: 0, type: '测试', message: '连通性测试' } },
      });
      if (res.success) {
        toast.success(res.msg ?? '对接成功', { id: toastId });
      } else {
        toast.error(res.msg ?? '对接失败', { id: toastId });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '对接失败', { id: toastId });
    }
  }

  const categories = Array.from(new Set(systems.map(s => s.category)));

  return (
    <div className="p-6">
      <PageHeader title="数据对接" description="预留与第三方系统的对接接口，统一适配器层管理" />
      <div className="mb-4 rounded-xl border bg-card p-4 text-sm text-muted-foreground">
        <Link2 className="mr-1 inline h-4 w-4 text-green-600" />
        平台已按「适配器注册表 + 统一对接入口」预留与第三方系统的接口扩展点。当前为演示占位实现，正式上线时在
        <code className="mx-1 rounded bg-muted px-1">src/external/adapters.ts</code>中补齐真实鉴权与 HTTP 调用即可。
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">加载中…</div>
      ) : (
        <div className="space-y-6">
          {categories.map(cat => (
            <Card key={cat}>
              <CardHeader>
                <CardTitle className="text-base">{CATEGORY_LABEL[cat] ?? cat}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {systems.filter(s => s.category === cat).map(s => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        <Badge variant={s.priority === 'p0' ? 'destructive' : s.priority === 'p1' ? 'secondary' : 'outline'}>
                          {PRIORITY_LABEL[s.priority]}
                        </Badge>
                        <Badge variant="outline">{DIRECTION_LABEL[s.direction]}</Badge>
                        {s.hasAdapter && <Badge variant="default" className="bg-green-600">适配器已注册</Badge>}
                        {s.enabled && <Badge className="bg-emerald-600">已启用</Badge>}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">{s.desc}</div>
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {s.endpoints.map(ep => (
                          <code key={ep} className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">{ep}</code>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" disabled={!s.enabled} onClick={() => testConnect(s)}>
                        <Send className="mr-1 h-3.5 w-3.5" />测试对接
                      </Button>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={s.enabled}
                          onCheckedChange={v => toggle(s, v)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}