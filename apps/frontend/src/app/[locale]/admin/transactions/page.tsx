'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import * as Select from '@radix-ui/react-select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { ChevronDown, ChevronLeft, ChevronRight, ListOrdered, CheckCircle2, XCircle, Clock } from 'lucide-react';

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'success', label: 'Success' },
  { value: 'pending', label: 'Pending' },
  { value: 'failed', label: 'Failed' },
];

export default function AdminTransactionsPage({ params: { locale } }: { params: { locale: string } }) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-transactions', page, statusFilter],
    queryFn: async () => {
      const res = await apiEndpoints.admin.transactions({ page, status: statusFilter || undefined });
      return res.data.data;
    },
  });

  const transactions = data?.transactions ?? data?.results ?? data ?? [];
  const totalPages = data?.totalPages ?? data?.pages ?? 1;
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-10 w-72 rounded-lg bg-card animate-pulse" />
        <div className="h-72 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Transactions</h1>

      <div className="flex items-center gap-3 flex-wrap">
        <Select.Root value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <Select.Trigger className="flex items-center justify-between min-w-[160px] h-10 px-3 rounded-lg border border-border bg-surface text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <Select.Value placeholder="All Statuses" />
            <Select.Icon><ChevronDown className="h-4 w-4" /></Select.Icon>
          </Select.Trigger>
          <Select.Portal>
            <Select.Content className="z-50 bg-surface border border-border rounded-lg shadow-xl">
              <Select.Viewport className="p-1">
                {statusOptions.map((opt) => (
                  <Select.Item
                    key={opt.value}
                    value={opt.value}
                    className="flex items-center px-3 py-2 text-sm text-text-primary hover:bg-surface-hover rounded-md cursor-pointer outline-none data-[state=checked]:text-primary"
                  >
                    <Select.ItemText>{opt.label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {total > 0 && (
          <span className="text-sm text-text-secondary">{total} transaction{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="p-4 font-medium">Reference</th>
                    <th className="p-4 font-medium">Owner</th>
                    <th className="p-4 font-medium">Hotspot</th>
                    <th className="p-4 font-medium">Amount</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx: { _id: string; reference: string; owner?: { fullName: string }; hotspot?: { name: string }; amount: number; currency: string; status: string; createdAt: string }) => (
                    <tr key={tx._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4 font-mono text-xs">{tx.reference}</td>
                      <td className="p-4">{tx.owner?.fullName || 'N/A'}</td>
                      <td className="p-4 text-text-secondary">{tx.hotspot?.name || 'N/A'}</td>
                      <td className="p-4 font-medium">{formatCurrency(tx.amount, tx.currency)}</td>
                      <td className="p-4">
                        <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'destructive' : 'warning'}>
                          {tx.status === 'success' && <CheckCircle2 className="h-3 w-3 mr-1 inline" />}
                          {tx.status === 'failed' && <XCircle className="h-3 w-3 mr-1 inline" />}
                          {tx.status === 'pending' && <Clock className="h-3 w-3 mr-1 inline" />}
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary text-xs">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <ListOrdered className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">No transactions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-text-secondary px-3">
            Page {page} of {totalPages}
          </span>
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
