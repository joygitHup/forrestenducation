'use client';
import { useEffect, useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/admin/page-header';
import { toast } from 'sonner';

interface Rule {
  id: number; name: string; patrolWeight: number; eventWeight: number; studyWeight: number;
  patrolTarget?: number; checkinTarget?: number; effectiveDate?: string;
}

export default function AssessmentRulesPage() {
  const { data, loading, reload } = useApi<{ success: boolean; data: Rule[] }>('/api/assessment/rules');
  const [form, setForm] = useState({ name: '', patrolWeight: 40, eventWeight: 30, studyWeight: 30, patrolTarget: 100, checkinTarget: 20, effectiveDate: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const r = data?.data?.[0];
    if (r) setForm({
      name: r.name, patrolWeight: r.patrolWeight, eventWeight: r.eventWeight, studyWeight: r.studyWeight,
      patrolTarget: r.patrolTarget ?? 100, checkinTarget: r.checkinTarget ?? 20, effectiveDate: r.effectiveDate ?? '',
    });
  }, [data]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const sum = form.patrolWeight + form.eventWeight + form.studyWeight;
    if (sum !== 100) return toast.error('三项权重之和必须为100');
    setSaving(true);
    try {
      await api('/api/assessment/rules', { method: 'POST', body: form });
      toast.success('考核规则已保存');
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6">
      <PageHeader title="考核规则配置" description="定义巡护、上报、培训三项得分权重与目标" />
      <Card className="max-w-xl">
        <CardHeader><CardTitle className="text-base">当前考核规则</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="text-sm text-muted-foreground">加载中…</div> : (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5"><Label>规则名称</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-4">
                <WeightField label="巡护权重 %" value={form.patrolWeight} onChange={v => setForm({ ...form, patrolWeight: v })} />
                <WeightField label="上报权重 %" value={form.eventWeight} onChange={v => setForm({ ...form, eventWeight: v })} />
                <WeightField label="培训权重 %" value={form.studyWeight} onChange={v => setForm({ ...form, studyWeight: v })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><Label>月巡护里程目标(km)</Label><Input type="number" value={form.patrolTarget} onChange={e => setForm({ ...form, patrolTarget: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label>月打点次数目标</Label><Input type="number" value={form.checkinTarget} onChange={e => setForm({ ...form, checkinTarget: Number(e.target.value) })} /></div>
              </div>
              <div className="space-y-1.5"><Label>生效日期</Label><Input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} /></div>
              <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={saving}>{saving ? '保存中…' : '保存规则'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function WeightField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm">{label}</Label>
      <Input type="number" value={value} onChange={e => onChange(Number(e.target.value))} />
    </div>
  );
}