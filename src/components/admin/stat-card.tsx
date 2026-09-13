import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export function StatCard({
  icon,
  label,
  value,
  tone = 'default',
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  tone?: 'default' | 'green' | 'orange' | 'red';
}) {
  const tones: Record<string, string> = {
    default: 'text-foreground',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
  };
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</div>
        <div className="min-w-0">
          <div className="truncate text-xs text-muted-foreground">{label}</div>
          <div className={cn('text-2xl font-semibold tabular-nums leading-tight', tones[tone])}>{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}