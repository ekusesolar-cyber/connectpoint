'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Ticket, Plus, Copy, CheckCircle2, XCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { apiEndpoints } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function VouchersPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [showGenerate, setShowGenerate] = useState(false);
  const [filterHotspot, setFilterHotspot] = useState('');
  const [page, setPage] = useState(1);
  const [genForm, setGenForm] = useState({ hotspotId: '', packageId: '', count: '1' });

  const { data: hotspots } = useQuery({
    queryKey: ['owner-hotspots'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.hotspots.list();
      return res.data.data;
    },
  });

  const { data: packages } = useQuery({
    queryKey: ['owner-packages', filterHotspot],
    queryFn: async () => {
      const res = await apiEndpoints.owner.packages.list(filterHotspot || undefined);
      return res.data.data;
    },
    enabled: !!filterHotspot,
  });

  const { data: vouchersData, isLoading } = useQuery({
    queryKey: ['owner-vouchers', filterHotspot, page],
    queryFn: async () => {
      const res = await apiEndpoints.owner.vouchers.list(filterHotspot, page);
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiEndpoints.owner.vouchers.generate(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['owner-vouchers'] });
      toast.success(t('vouchersGenerated', { count: res.data.data?.length ?? genForm.count }));
      setShowGenerate(false);
      setGenForm({ hotspotId: '', packageId: '', count: '1' });
    },
  });

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    generateMutation.mutate({ hotspotId: genForm.hotspotId, packageId: genForm.packageId, count: Number(genForm.count) });
  }

  function copyToClipboard(code: string) {
    navigator.clipboard.writeText(code);
    toast.success(t('copied'));
  }

  const vouchers = vouchersData?.data ?? [];
  const totalPages = vouchersData?.totalPages ?? 1;

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
          <div className="h-10 w-40 rounded-lg bg-card animate-pulse" />
        </div>
        <div className="h-64 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('vouchers')}</h1>
        <Button onClick={() => setShowGenerate(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('generateVoucher')}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
          <select
            className="pl-10 flex h-10 w-56 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={filterHotspot}
            onChange={(e) => { setFilterHotspot(e.target.value); setPage(1); }}
          >
            <option value="">{t('allHotspots')}</option>
            {(hotspots ?? []).map((h: Record<string, unknown>) => (
              <option key={h._id as string} value={h._id as string}>{h.name as string}</option>
            ))}
          </select>
        </div>
      </div>

      {vouchers.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('code')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('pin')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('package')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('status')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('expiry')}</th>
                    <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {vouchers.map((v: Record<string, unknown>) => (
                    <tr key={v._id as string} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-mono text-sm">{v.code as string}</td>
                      <td className="p-4 font-mono text-sm">{v.pin as string}</td>
                      <td className="p-4 text-sm">{v.packageName as string}</td>
                      <td className="p-4">
                        <Badge variant={v.status === 'used' ? 'destructive' : 'success'}>
                          {v.status === 'used' ? (
                            <XCircle className="h-3 w-3 mr-1 inline" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                          )}
                          {v.status as string}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-text-secondary">{v.expiresAt ? formatDateTime(v.expiresAt as string) : '-'}</td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(v.code as string)}>
                          <Copy className="h-3.5 w-3.5 mr-1" />
                          {t('copy')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-border">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                  {t('previous')}
                </Button>
                <span className="text-sm text-text-secondary">{t('page', { page, total: totalPages })}</span>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
                  {t('next')}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Ticket className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary mb-4">{t('noVouchers')}</p>
            <Button onClick={() => setShowGenerate(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('generateVoucher')}
            </Button>
          </CardContent>
        </Card>
      )}

      {showGenerate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{t('generateVoucher')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('hotspot')}</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={genForm.hotspotId}
                    onChange={(e) => { setGenForm({ ...genForm, hotspotId: e.target.value, packageId: '' }); }}
                    required
                  >
                    <option value="">{t('selectHotspot')}</option>
                    {(hotspots ?? []).map((h: Record<string, unknown>) => (
                      <option key={h._id as string} value={h._id as string}>{h.name as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('package')}</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={genForm.packageId}
                    onChange={(e) => setGenForm({ ...genForm, packageId: e.target.value })}
                    required
                    disabled={!genForm.hotspotId}
                  >
                    <option value="">{t('selectPackage')}</option>
                    {(packages ?? []).map((p: Record<string, unknown>) => (
                      <option key={p._id as string} value={p._id as string}>{p.name as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('quantity')}</label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={genForm.count}
                    onChange={(e) => setGenForm({ ...genForm, count: e.target.value })}
                    required
                  />
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={generateMutation.isPending}>
                    {t('generate')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowGenerate(false)}>
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
