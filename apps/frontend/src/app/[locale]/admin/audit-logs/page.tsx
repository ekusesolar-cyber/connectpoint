'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiEndpoints } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';

export default function AdminAuditLogsPage({ params: { locale } }: { params: { locale: string } }) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-audit-logs', page],
    queryFn: async () => {
      const res = await apiEndpoints.admin.auditLogs(page);
      return res.data.data;
    },
  });

  const logs = data?.logs ?? data?.results ?? data ?? [];
  const totalPages = data?.totalPages ?? data?.pages ?? 1;
  const total = data?.total ?? 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-72 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        {total > 0 && (
          <span className="text-sm text-text-secondary">{total} log{total !== 1 ? 's' : ''}</span>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Action</th>
                    <th className="p-4 font-medium">Entity</th>
                    <th className="p-4 font-medium">IP Address</th>
                    <th className="p-4 font-medium">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: { _id: string; user?: { fullName: string; email: string }; action: string; entity: string; entityId?: string; ipAddress?: string; metadata?: string; createdAt: string }) => (
                    <tr key={log._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4">
                        <div className="font-medium">{log.user?.fullName || 'System'}</div>
                        {log.user?.email && <div className="text-xs text-text-secondary">{log.user.email}</div>}
                      </td>
                      <td className="p-4">
                        <Badge variant={
                          log.action === 'create' ? 'success' :
                          log.action === 'update' ? 'warning' :
                          log.action === 'delete' ? 'destructive' : 'info'
                        }>
                          {log.action}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary">
                        <div>{log.entity}</div>
                        {log.entityId && <div className="text-xs font-mono">{log.entityId.slice(0, 12)}...</div>}
                      </td>
                      <td className="p-4 font-mono text-xs text-text-secondary">{log.ipAddress || '—'}</td>
                      <td className="p-4 text-text-secondary text-xs">{formatDateTime(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <FileText className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">No audit logs found</p>
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
