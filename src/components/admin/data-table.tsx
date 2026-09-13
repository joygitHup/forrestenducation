'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  right?: boolean;
}

export function TabularTable<T extends { id: number }>({
  columns,
  rows,
  loading,
  empty = '暂无数据',
  footer,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map(c => (
              <TableHead key={c.key} className={c.right ? 'text-right' : ''}>{c.label}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && (
            <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">加载中…</TableCell></TableRow>
          )}
          {!loading && rows.length === 0 && (
            <TableRow><TableCell colSpan={columns.length} className="py-10 text-center text-muted-foreground">{empty}</TableCell></TableRow>
          )}
          {!loading && rows.map(row => (
            <TableRow key={row.id}>
              {columns.map(c => (
                <TableCell key={c.key} className={c.right ? 'text-right' : ''}>
                  {c.render ? c.render(row) : (row as Record<string, unknown>)[c.key] as React.ReactNode}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </div>
  );
}