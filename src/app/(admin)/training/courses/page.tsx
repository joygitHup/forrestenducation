'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { Course, CourseWritePayload } from '@/types';
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
import { Plus, Trash2 } from 'lucide-react';
import { MSG, notify } from '@/lib/feedback';
import { deleteConfirm, useConfirm } from '@/components/feedback/confirm-provider';

const emptyForm = { title: '', type: '1', duration: '', status: '1', sort: '', coverUrl: '', contentUrl: '' };

function buildCourseQuery(keyword: string, type: string, status: string) {
  const q = new URLSearchParams();
  if (keyword.trim()) q.set('keyword', keyword.trim());
  if (type !== 'all') q.set('type', type);
  if (status !== 'all') q.set('status', status);
  const qs = q.toString();
  return qs ? `/api/course?${qs}` : '/api/course';
}

export default function CoursesPage() {
  const confirm = useConfirm();
  const [keyword, setKeyword] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const { data, loading, reload } = useApi<{ success: boolean; data: Course[] }>(
    buildCourseQuery(keyword, type, status),
  );
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);

  const list = data?.data ?? [];

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      notify.warning('课程标题为必填项');
      return;
    }
    const payload: CourseWritePayload = {
      title: form.title.trim(),
      type: Number(form.type) as 1 | 2,
      duration: form.duration ? Number(form.duration) : null,
      status: Number(form.status) as 1 | 0,
      sort: form.sort ? Number(form.sort) : 0,
      coverUrl: form.coverUrl.trim(),
      contentUrl: form.contentUrl.trim(),
    };
    try {
      if (editing) {
        await api(`/api/course/${editing}`, { method: 'PUT', body: payload });
        notify.success(MSG.updated);
      } else {
        await api('/api/course', { method: 'POST', body: payload });
        notify.success(MSG.created);
      }
      setOpen(false);
      reload();
    } catch (err) {
      notify.error(err, '保存失败');
    }
  }

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setOpen(true);
  }

  function openEdit(c: Course) {
    setForm({
      title: c.title,
      type: String(c.type),
      duration: c.duration != null ? String(c.duration) : '',
      status: String(c.status),
      sort: String(c.sort),
      coverUrl: c.coverUrl ?? '',
      contentUrl: c.contentUrl ?? '',
    });
    setEditing(c.id);
    setOpen(true);
  }

  async function handleDelete(id: number) {
    const ok = await confirm(deleteConfirm('该课程'));
    if (!ok) return;
    try {
      await api(`/api/course/${id}`, { method: 'DELETE' });
      notify.success(MSG.deleted);
      reload();
    } catch (err) {
      notify.error(err, '删除失败（可能已被学习记录引用）');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="课程管理"
        description="护林员培训课程配置"
        actions={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新增课程</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索课程标题"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-32"><SelectValue placeholder="课程类型" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部类型</SelectItem>
            <SelectItem value="1">视频</SelectItem>
            <SelectItem value="2">图文</SelectItem>
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-32"><SelectValue placeholder="上架状态" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部状态</SelectItem>
            <SelectItem value="1">上架</SelectItem>
            <SelectItem value="0">下架</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无课程"
        columns={[
          { key: 'title', label: '课程标题', render: c => <span className="font-medium">{c.title}</span> },
          { key: 'type', label: '类型', render: c => (
            <Badge variant={c.type === 1 ? 'default' : 'secondary'}>{c.typeName ?? (c.type === 1 ? '视频' : '图文')}</Badge>
          ) },
          { key: 'duration', label: '时长', render: c => c.duration ? `${Math.round(c.duration / 60)}分` : '-' },
          { key: 'sort', label: '排序' },
          { key: 'status', label: '状态', render: c => (
            <Badge variant={c.status === 1 ? 'default' : 'outline'}>{c.statusName ?? (c.status === 1 ? '上架' : '下架')}</Badge>
          ) },
          { key: 'actions', label: '操作', right: true, render: c => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>编辑</Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(c.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
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
            <div className="space-y-1.5">
              <Label>课程标题*</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>类型</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">视频</SelectItem>
                    <SelectItem value="2">图文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>时长(秒)</Label>
                <Input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>排序</Label>
                <Input type="number" value={form.sort} onChange={e => setForm({ ...form, sort: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>状态</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">上架</SelectItem>
                    <SelectItem value="0">下架</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>封面地址</Label>
              <Input value={form.coverUrl} onChange={e => setForm({ ...form, coverUrl: e.target.value })} placeholder="coverUrl" />
            </div>
            <div className="space-y-1.5">
              <Label>内容地址</Label>
              <Input value={form.contentUrl} onChange={e => setForm({ ...form, contentUrl: e.target.value })} placeholder="contentUrl" />
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
