'use client';
import { useState } from 'react';
import { useApi } from '@/hooks/use-api';
import { api } from '@/lib/api';
import type { AdminRole, AdminUser, AdminUserWritePayload } from '@/types';
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
import { Pencil, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import { MSG, notify } from '@/lib/feedback';
import { deleteConfirm, useConfirm } from '@/components/feedback/confirm-provider';

interface TownOption { id: number; name: string }

const ROLE_LABEL: Record<AdminRole, string> = {
  super: '超级管理员',
  district: '区级管理员',
  town: '乡镇管理员',
};

const emptyForm: AdminUserWritePayload = {
  username: '',
  name: '',
  role: 'district',
  townId: null,
};

function buildUserQuery(keyword: string, role: string) {
  const q = new URLSearchParams();
  if (keyword.trim()) q.set('keyword', keyword.trim());
  if (role !== 'all') q.set('role', role);
  const qs = q.toString();
  return qs ? `/api/users?${qs}` : '/api/users';
}

export default function UsersPage() {
  const confirm = useConfirm();
  const [keyword, setKeyword] = useState('');
  const [role, setRole] = useState('all');
  const { data, loading, reload } = useApi<{ success: boolean; data: AdminUser[] }>(
    buildUserQuery(keyword, role),
  );
  const towns = useApi<{ success: boolean; data: TownOption[] }>('/api/org?kind=town');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<AdminUserWritePayload>(emptyForm);

  const list = data?.data ?? [];
  const townOptions = towns.data?.data ?? [];

  function openCreate() {
    setForm(emptyForm);
    setEditing(null);
    setOpen(true);
  }

  function openEdit(u: AdminUser) {
    setForm({
      username: u.username,
      name: u.name,
      role: u.role,
      townId: u.townId ?? null,
    });
    setEditing(u.id);
    setOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.username.trim() || !form.name.trim()) {
      notify.warning('用户名、姓名为必填项');
      return;
    }
    if (form.role === 'town' && !form.townId) {
      notify.warning('乡镇管理员必须选择所属乡镇');
      return;
    }
    const payload: AdminUserWritePayload = {
      username: form.username.trim(),
      name: form.name.trim(),
      role: form.role,
      townId: form.role === 'town' ? form.townId : null,
    };
    try {
      if (editing) {
        await api(`/api/users/${editing}`, { method: 'PUT', body: payload });
        notify.success(MSG.updated);
      } else {
        await api('/api/users', { method: 'POST', body: payload });
        notify.success(MSG.created);
      }
      setOpen(false);
      reload();
    } catch (err) {
      notify.error(err, '保存失败');
    }
  }

  async function handleDelete(id: number) {
    const ok = await confirm(deleteConfirm('该用户'));
    if (!ok) return;
    try {
      await api(`/api/users/${id}`, { method: 'DELETE' });
      notify.success(MSG.deleted);
      reload();
    } catch (err) {
      notify.error(err, '删除失败');
    }
  }

  return (
    <div className="p-6">
      <PageHeader
        title="用户权限"
        description="管理登录用户与角色权限"
        actions={<Button onClick={openCreate}><Plus className="mr-1 h-4 w-4" />新增用户</Button>}
      />
      <div className="mb-4 rounded-xl border bg-card p-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <span>当前为演示环境，管理端账号由系统初始化。真实环境可接入认证中心实现密码/手机号登录与角色分配。</span>
        </div>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        <Input
          placeholder="搜索用户名/姓名"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          className="max-w-xs"
        />
        <Select value={role} onValueChange={setRole}>
          <SelectTrigger className="w-40"><SelectValue placeholder="角色" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全部角色</SelectItem>
            {Object.entries(ROLE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <TabularTable
        loading={loading}
        empty="暂无用户"
        columns={[
          { key: 'username', label: '用户名', render: u => <span className="font-medium">{u.username}</span> },
          { key: 'name', label: '姓名' },
          { key: 'role', label: '角色', render: u => <Badge variant="secondary">{u.roleName ?? ROLE_LABEL[u.role]}</Badge> },
          { key: 'townName', label: '所属乡镇', render: u => u.townName ?? '-' },
          { key: 'actions', label: '操作', right: true, render: u => (
            <div className="flex justify-end gap-1">
              <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(u.id)}>
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
            <DialogTitle>{editing ? '编辑用户' : '新增用户'}</DialogTitle>
            <DialogDescription>配置登录账号与角色权限</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-1.5">
              <Label>用户名*</Label>
              <Input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} disabled={!!editing} />
            </div>
            <div className="space-y-1.5">
              <Label>姓名*</Label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>角色</Label>
              <Select
                value={form.role}
                onValueChange={v => setForm({ ...form, role: v as AdminRole, townId: v === 'town' ? form.townId : null })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {form.role === 'town' && (
              <div className="space-y-1.5">
                <Label>所属乡镇*</Label>
                <Select
                  value={form.townId ? String(form.townId) : undefined}
                  onValueChange={v => setForm({ ...form, townId: Number(v) })}
                >
                  <SelectTrigger><SelectValue placeholder="选择乡镇" /></SelectTrigger>
                  <SelectContent>
                    {townOptions.map(t => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
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
