'use client';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useSession } from '@/hooks/use-session';
import AdminSidebar from './sidebar';

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">加载中…</div>;
  }
  if (!user) return null;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AdminSidebar key={pathname} />
      <main className="flex-1 overflow-y-auto bg-muted/20">{children}</main>
    </div>
  );
}