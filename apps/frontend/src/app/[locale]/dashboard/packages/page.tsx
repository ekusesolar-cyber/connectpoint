'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Package, Plus, Edit2, Trash2, Clock, Database, Gauge, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDuration, formatBytes } from '@/lib/utils';
import toast from 'react-hot-toast';

interface PackageForm {
  hotspotId: string;
  name: string;
  type: string;
  price: string;
  duration: string;
  dataLimit: string;
  speedLimit: string;
}

export default function PackagesPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<PackageForm>({ hotspotId: '', name: '', type: 'time', price: '', duration: '', dataLimit: '', speedLimit: '' });

  const { data: hotspots } = useQuery({
    queryKey: ['owner-hotspots'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.hotspots.list();
      return res.data.data;
    },
  });

  const { data: packages, isLoading } = useQuery({
    queryKey: ['owner-packages'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.packages.list();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiEndpoints.owner.packages.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-packages'] });
      toast.success(t('packageCreated'));
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiEndpoints.owner.packages.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-packages'] });
      toast.success(t('packageUpdated'));
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiEndpoints.owner.packages.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-packages'] });
      toast.success(t('packageDeleted'));
    },
  });

  const packageTypeIcons: Record<string, React.ReactNode> = {
    time: <Clock className="h-4 w-4" />,
    data: <Database className="h-4 w-4" />,
    speed: <Gauge className="h-4 w-4" />,
    unlimited: <Infinity className="h-4 w-4" />,
  };

  function resetForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ hotspotId: '', name: '', type: 'time', price: '', duration: '', dataLimit: '', speedLimit: '' });
  }

  function handleEdit(pkg: Record<string, unknown>) {
    setEditing(pkg);
    setForm({
      hotspotId: pkg.hotspotId as string,
      name: pkg.name as string,
      type: pkg.type as string,
      price: String(pkg.price ?? ''),
      duration: String(pkg.duration ?? ''),
      dataLimit: String(pkg.dataLimit ?? ''),
      speedLimit: String(pkg.speedLimit ?? ''),
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Record<string, unknown> = {
      hotspotId: form.hotspotId,
      name: form.name,
      type: form.type,
      price: Number(form.price),
    };
    if (form.duration) payload.duration = Number(form.duration);
    if (form.dataLimit) payload.dataLimit = Number(form.dataLimit);
    if (form.speedLimit) payload.speedLimit = Number(form.speedLimit);

    if (editing) {
      updateMutation.mutate({ id: editing._id as string, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  const grouped = (packages ?? []).reduce((acc: Record<string, Record<string, unknown>[]>, pkg: Record<string, unknown>) => {
    const key = (pkg.hotspotId as string) || 'unknown';
    if (!acc[key]) acc[key] = [];
    acc[key].push(pkg);
    return acc;
  }, {});

  const hotspotMap = (hotspots ?? []).reduce((acc: Record<string, string>, h: Record<string, unknown>) => {
    acc[h._id as string] = h.name as string;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-card animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('packages')}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addPackage')}
        </Button>
      </div>

      {Object.keys(grouped).length > 0 ? (
        Object.entries(grouped).map(([hotspotId, pkgs]) => (
          <div key={hotspotId}>
            <h2 className="text-lg font-semibold mb-3 text-primary">
              {hotspotMap[hotspotId] || t('unknownHotspot')}
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
              {pkgs.map((pkg: Record<string, unknown>) => (
                <Card key={pkg._id as string} className="hover:border-primary/50 transition-colors group">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {packageTypeIcons[pkg.type as string] || <Package className="h-4 w-4" />}
                      </div>
                      <Badge variant={pkg.type === 'unlimited' ? 'success' : 'default'}>
                        {pkg.type as string}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-lg mb-1">{pkg.name as string}</h3>
                    <p className="text-2xl font-bold text-primary mb-3">{formatCurrency(Number(pkg.price))}</p>
                    <div className="space-y-1 text-xs text-text-secondary">
                      {pkg.duration && (
                        <p>{t('duration')}: {formatDuration(Number(pkg.duration))}</p>
                      )}
                      {pkg.dataLimit && (
                        <p>{t('dataLimit')}: {formatBytes(Number(pkg.dataLimit))}</p>
                      )}
                      {pkg.speedLimit && (
                        <p>{t('speedLimit')}: {pkg.speedLimit} Mbps</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(pkg)}>
                        <Edit2 className="h-3.5 w-3.5 mr-1" />
                        {t('edit')}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (confirm(t('confirmDelete'))) {
                            deleteMutation.mutate(pkg._id as string);
                          }
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        {t('delete')}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Package className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary mb-4">{t('noPackages')}</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addPackage')}
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editing ? t('editPackage') : t('addPackage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('hotspot')}</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.hotspotId}
                    onChange={(e) => setForm({ ...form, hotspotId: e.target.value })}
                    required
                  >
                    <option value="">{t('selectHotspot')}</option>
                    {(hotspots ?? []).map((h: Record<string, unknown>) => (
                      <option key={h._id as string} value={h._id as string}>{h.name as string}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('name')}</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('type')}</label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="time">{t('time')}</option>
                    <option value="data">{t('dataVolume')}</option>
                    <option value="speed">{t('speed')}</option>
                    <option value="unlimited">{t('unlimited')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('priceXaf')}</label>
                  <input
                    type="number"
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                {form.type === 'time' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('durationSeconds')}</label>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={form.duration}
                      onChange={(e) => setForm({ ...form, duration: e.target.value })}
                      min="0"
                    />
                  </div>
                )}
                {form.type === 'data' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('dataLimitBytes')}</label>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={form.dataLimit}
                      onChange={(e) => setForm({ ...form, dataLimit: e.target.value })}
                      min="0"
                    />
                  </div>
                )}
                {form.type === 'speed' && (
                  <div>
                    <label className="block text-sm font-medium mb-1.5">{t('speedLimitMbps')}</label>
                    <input
                      type="number"
                      className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      value={form.speedLimit}
                      onChange={(e) => setForm({ ...form, speedLimit: e.target.value })}
                      min="0"
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editing ? t('update') : t('create')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={resetForm}>
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
