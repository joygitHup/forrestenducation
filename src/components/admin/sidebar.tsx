'use client';
import { useEffect, useState, type ReactElement, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  ClipboardCheck,
  Flame,
  Settings,
  ChevronDown,
  LogOut,
  TreePine,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from '@/hooks/use-session';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  children?: { href: string; label: string }[];
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

const COLLAPSE_KEY = 'ranger_admin_sidebar_collapsed';

function matchActive(item: NavItem, pathname: string): boolean {
  const itemPath = item.href.split('/')[1];
  return pathname.split('/')[1] === itemPath;
}

function Tip({ enabled, label, children }: { enabled: boolean; label: string; children: ReactElement }) {
  if (!enabled) return children;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useSession();
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem(COLLAPSE_KEY) === '1');
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setOpen(prev => {
      let changed = false;
      const next = { ...prev };
      for (const item of NAV) {
        if (item.children && matchActive(item, pathname) && next[item.href] !== true) {
          next[item.href] = true;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [pathname]);

  function persistCollapsed(next: boolean) {
    setCollapsed(next);
    try {
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0');
    } catch {
      /* ignore */
    }
  }

  return (
    <aside
      className={cn(
        'flex h-full shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-linear',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div
        className={cn(
          'flex border-b',
          collapsed ? 'flex-col items-center gap-1 px-2 py-2' : 'h-14 items-center gap-2 px-3',
        )}
      >
        <TreePine className="h-5 w-5 shrink-0 text-green-600" />
        {!collapsed && (
          <div className="min-w-0 flex-1 text-sm font-semibold leading-tight">
            生态护林员智能管理平台
            <div className="text-xs font-normal text-muted-foreground">巴州区 · 管理端</div>
          </div>
        )}
        <Tip enabled={collapsed} label={collapsed ? '展开菜单' : '收起菜单'}>
          <button
            type="button"
            onClick={() => persistCollapsed(!collapsed)}
            title={collapsed ? '展开菜单' : '收起菜单'}
            aria-label={collapsed ? '展开菜单' : '收起菜单'}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        </Tip>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map(item => {
          const active = matchActive(item, pathname);
          const isGroup = !!item.children && item.children.length > 0;
          const expanded = !collapsed && (open[item.href] ?? active);
          const itemClass = cn(
            'flex items-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
            collapsed ? 'justify-center px-0 py-2' : 'gap-3 px-3 py-2',
            active && 'bg-primary/10 text-primary',
          );

          if (!isGroup) {
            return (
              <Tip key={item.href} enabled={collapsed} label={item.label}>
                <Link href={item.href} className={itemClass}>
                  {item.icon}
                  {!collapsed && item.label}
                </Link>
              </Tip>
            );
          }

          return (
            <div key={item.href}>
              <Tip enabled={collapsed} label={item.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => {
                    if (collapsed) {
                      persistCollapsed(false);
                      setOpen(p => ({ ...p, [item.href]: true }));
                      return;
                    }
                    setOpen(p => ({ ...p, [item.href]: !expanded }));
                  }}
                  className={cn(itemClass, 'w-full')}
                >
                  {item.icon}
                  {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                  {!collapsed && (
                    <ChevronDown className={cn('h-4 w-4 transition-transform', expanded && 'rotate-180')} />
                  )}
                </button>
              </Tip>
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
      <div className={cn('border-t', collapsed ? 'p-2' : 'p-3')}>
        {collapsed ? (
          <div className="flex flex-col items-center gap-1">
            <Tip enabled label={user?.name ?? '管理员'}>
              <div className="flex h-8 w-8 items-center justify-center rounded-md text-xs font-medium">
                {(user?.name ?? '管').slice(0, 1)}
              </div>
            </Tip>
            <Tip enabled label="退出登录">
              <button
                type="button"
                onClick={logout}
                aria-label="退出登录"
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </Tip>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">{user?.name ?? '管理员'}</div>
              <div className="truncate text-xs text-muted-foreground">{user?.username ?? ''}</div>
            </div>
            <button
              type="button"
              onClick={logout}
              title="退出登录"
              aria-label="退出登录"
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
