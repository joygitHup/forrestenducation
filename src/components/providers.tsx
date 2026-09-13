'use client';
import { Toaster } from 'sonner';
import { SessionProvider } from '@/hooks/use-session';
import { ConfirmProvider } from '@/components/feedback/confirm-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ConfirmProvider>
        {children}
        <Toaster richColors position="top-center" />
      </ConfirmProvider>
    </SessionProvider>
  );
}
