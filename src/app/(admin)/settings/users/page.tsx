'use client';
import { useApi } from '@/hooks/use-api';
import { Badge } from '@/components/ui/badge';
import { TabularTable } from '@/components/admin/data-table';
import { PageHeader } from '@/components/admin/page-header';
import { ShieldCheck } from 'lucide-react';

interface User {
  id: number; username: string; name: string; role: 'super'|'district'|'town';
}

const ROLE_LABEL: Record<string, string> = { super: '超级管理员', district: '区级管理员', town: '乡镇管理员' };

export default function UsersPage() {
  const { data, loading } = useApi<{ success: boolean; data: User[] }>('/api/org?kind=users');
  // 用户权限数据从独立服务获取
  const { data: userData, loading: userLoading } = useApi<{ success: boolean; data: User[] }>('/api/auth/users');
  const list = userData?.data ?? data?.data ?? [];

  return (
    <div className="p-6">
      <PageHeader title="用户权限" description="管理登录用户与角色权限" />
      <div className="mb-4 rounded-xl border bg-card p-4 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <ShieldCheck className="h-5 w-5 text-green-600" />
          <span>当前为演示环境，管理端账号由系统初始化。真实环境可接入 supabase-auth 实现密码/手机号登录与角色分配。</span>
        </div>
      </div>
      <TabularTable
        loading={loading || userLoading}
        empty="暂无用户"
        columns={[
          { key: 'username', label: '用户名', render: u => <span className="font-medium">{u.username}</span> },
          { key: 'name', label: '姓名' },
          { key: 'role', label: '角色', render: u => <Badge variant="secondary">{ROLE_LABEL[u.role] ?? u.role}</Badge> },
        ]}
        rows={list}
      />
    </div>
  );
}