'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Course {
  id: number; title: string; type: 1|2; duration?: number; sort: number; status: number; createdAt: string;
}

export default function CoursesPage() {
  const { data, loading, reload } = useApi<{ success: boolean; data: Course[] }>('/api/course');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ title: '', type: '1', duration: '', status: '1', sort: '' });

  const list = data?.data ?? [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title) return toast.error('课程标题为必填项');
    const body = { title: form.title, type: Number(form.type) as 1|2, duration: form.duration ? Number(form.duration) : undefined, status: Number(form.status) as 1|0, sort: form.sort ? Number(form.sort) : 0 };
    try {
      if (editing) {
        await api(`/api/course/${editing}`, { method: 'PUT', body });
        toast.success('已更新');
      } else {
        await api('/api/course', { method: 'POST', body });
        toast.success('已创建');
      }
      setOpen(false);
      reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '保存失败');
    }
  }

  function openEdit(c?: Course) {
    if (!c) { setForm({ title: '', type: '1', duration: '', status: '1', sort: '' }); setEditing(null); }
    else {
      setForm({ title: c.title, type: String(c.type), duration: c.duration ? String(c.duration) : '', status: String(c.status), sort: String(c.sort) });
      setEditing(c.id);
    }
    setOpen(true);
  }

  return (
    <div className="p-6">
      <PageHeader title="课程管理" description="护林员培训课程配置" actions={<Button onClick={() => openEdit()}><Plus className="mr-1 h-4 w-4" />新增课程</Button>} />
      <TabularTable
        loading={loading}
        empty="暂无课程"
        columns={[
          { key: 'title', label: '课程标题', render: c => <span className="font-medium">{c.title}</span> },
          { key: 'type', label: '类型', render: c => <Badge variant={c.type === 1 ? 'default' : 'secondary'}>{c.type === 1 ? '视频' : '图文'}</Badge> },
          { key: 'duration', label: '时长', render: c => c.duration ? `${Math.round(c.duration / 60)}分` : '-' },
          { key: 'sort', label: '排序' },
          { key: 'status', label: '状态', render: c => <Badge variant={c.status === 1 ? 'default' : 'outline'}>{c.status === 1 ? '上架' : '下架'}</Badge> },
          { key: 'actions', label: '操作', right: true, render: c => (
            <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>编辑</Button>
          )},
        ]}
        rows={list}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? '编辑课程' : '新增课程'}</DialogTitle>
            <DialogDescription>配置培训课程信息</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5"><Label>课程标题*</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>类型</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">视频</SelectItem><SelectItem value="2">图文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>时长(秒)</Label><Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>排序</Label><Input type="number" value={form.sort} onChange={e => setForm({ ...form, sort: e.target.value })} /></div>
              <div className="space-y-1.5">
                <Label>状态</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">上架</SelectItem><SelectItem value="0">下架</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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