import { useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  MapPinned,
  AlertTriangle,
  GraduationCap,
  ClipboardCheck,
  Flame,
  Settings,
  ChevronDown,
  LogOut,
  Bug,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  children?: { href: string; label: string }[];
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: '数据看板', icon: <LayoutDashboard className="h-4 w-4" /> },
  {
    href: '/ranger',
    label: '护林员管理',
    icon: <Users className="h-4 w-4" />,
    children: [
      { href: '/ranger', label: '护林员列表' },
      { href: '/area', label: '责任区域管理' },
      { href: '/warning', label: '智能预警' },
    ],
  },
  {
    href: '/training',
    label: '培训管理',
    icon: <GraduationCap className="h-4 w-4" />,
    children: [
      { href: '/training/courses', label: '课程管理' },
      { href: '/training/study', label: '学习记录' },
    ],
  },
  {
    href: '/assessment',
    label: '考核管理',
    icon: <ClipboardCheck className="h-4 w-4" />,
    children: [
      { href: '/assessment/rules', label: '考核规则配置' },
      { href: '/assessment', label: '考核结果' },
    ],
  },
  {
    href: '/event',
    label: '事件管理',
    icon: <Flame className="h-4 w-4" />,
    children: [
      { href: '/event', label: '事件列表' },
      { href: '/event/stats', label: '事件统计' },
    ],
  },
  {
    href: '/settings',
    label: '系统设置',
    icon: <Settings className="h-4 w-4" />,
    children: [
      { href: '/settings/org', label: '组织架构' },
      { href: '/settings/users', label: '用户权限' },
      { href: '/settings/integration', label: '数据对接' },
    ],
  },
];

function matchActive(item: NavItem, pathname: string): boolean {
  const itemPath = item.href.split('/')[1];
  return pathname.split('/')[1] === itemPath;
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const expandedGroups = useMemo(() => {
    const m: Record<string, boolean> = { ...open };
    NAV.forEach(i => {
      if (i.children && matchActive(i, pathname)) m[i.href] = true;
    });
    return m;
  }, [open, pathname]);

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Bug className="h-5 w-5 text-green-600" />
        <div className="text-sm font-semibold leading-tight">
          生态护林员智能管理平台
          <div className="text-xs font-normal text-muted-foreground">巴州区 · 管理端</div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map(item => {
          const active = matchActive(item, pathname);
          const isGroup = !!item.children && item.children.length > 0;
          const expanded = item.children ? !!expandedGroups[item.href] : false;
          if (!isGroup) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  active && 'bg-primary/10 text-primary',
                )}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          }
          return (
            <div key={item.href}>
              <button
                onClick={() => setOpen(p => ({ ...p, [item.href]: !p[item.href] }))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  active && 'bg-primary/10 text-primary',
                )}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
              </button>
              {expanded && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l pl-2">
                  {item.children!.map(c => {
                    const childActive = pathname === c.href;
                    return (
                      <Link
                        key={c.href}
                        href={c.href}
                        className={cn(
                          'block rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                          childActive && 'bg-primary/10 font-medium text-primary',
                        )}
                      >
                        {c.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">{user?.name ?? '管理员'}</div>
            <div className="truncate text-xs text-muted-foreground">{user?.username ?? ''}</div>
          </div>
          <button
            onClick={logout}
            title="退出登录"
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}