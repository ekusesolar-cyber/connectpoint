'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Users, LogOut, Ban, Filter, Wifi } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiEndpoints } from '@/lib/api';
import { formatDuration, formatBytes, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function UsersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [filterHotspot, setFilterHotspot] = useState('');
  const [blockMac, setBlockMac] = useState('');
  const [showBlock, setShowBlock] = useState(false);

  const { data: hotspots } = useQuery({
    queryKey: ['owner-hotspots'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.hotspots.list();
      return res.data.data;
    },
  });

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['owner-sessions', filterHotspot],
    queryFn: async () => {
      const res = await apiEndpoints.owner.sessions.active(filterHotspot || undefined);
      return res.data.data;
    },
    refetchInterval: 30000,
  });

  const disconnectMutation = useMutation({
    mutationFn: (id: string) => apiEndpoints.owner.sessions.disconnect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-sessions'] });
      toast.success(t('userDisconnected'));
    },
  });

  const blockMutation = useMutation({
    mutationFn: (data: { macAddress: string }) => apiEndpoints.owner.customers.block(data),
    onSuccess: () => {
      toast.success(t('macBlocked'));
      setShowBlock(false);
      setBlockMac('');
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
        </div>
        <div className="h-64 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">{t('activeUsers')}</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <select
              className="pl-10 flex h-10 w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={filterHotspot}
              onChange={(e) => setFilterHotspot(e.target.value)}
            >
              <option value="">{t('allHotspots')}</option>
              {(hotspots ?? []).map((h: Record<string, unknown>) => (
                <option key={h._id as string} value={h._id as string}>{h.name as string}</option>
              ))}
            </select>
          </div>
          <Button variant="outline" onClick={() => setShowBlock(true)}>
            <Ban className="h-4 w-4 mr-2" />
            {t('blockMac')}
          </Button>
        </div>
      </div>

      {sessions && sessions.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('username')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('package')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('hotspot')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('timeUsed')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('timeRemaining')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('dataUsed')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s: Record<string, unknown>) => (
                    <tr key={s._id as string} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Wifi className="h-4 w-4 text-secondary" />
                          <span className="font-medium text-sm">{s.username as string}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{s.packageName as string}</td>
                      <td className="p-4 text-sm text-text-secondary">{s.hotspotName as string}</td>
                      <td className="p-4 text-sm">{formatDuration(Number(s.timeUsed ?? 0))}</td>
                      <td className="p-4 text-sm">{s.timeRemaining ? formatDuration(Number(s.timeRemaining)) : '-'}</td>
                      <td className="p-4 text-sm">{formatBytes(Number(s.dataUsed ?? 0))}</td>
                      <td className="p-4">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => disconnectMutation.mutate(s._id as string)}
                          disabled={disconnectMutation.isPending}
                        >
                          <LogOut className="h-3.5 w-3.5 mr-1" />
                          {t('disconnect')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Users className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary">{t('noActiveUsers')}</p>
          </CardContent>
        </Card>
      )}

      {showBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{t('blockMacAddress')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  blockMutation.mutate({ macAddress: blockMac });
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('macAddress')}</label>
                  <Input
                    placeholder="AA:BB:CC:DD:EE:FF"
                    value={blockMac}
                    onChange={(e) => setBlockMac(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={blockMutation.isPending}>
                    {t('block')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowBlock(false)}>
                    {t('cancel')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
