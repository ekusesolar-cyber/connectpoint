'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Wifi, MapPin, Router, Plus, Power, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import toast from 'react-hot-toast';

export default function HotspotsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState({ name: '', address: '', routerType: '', routerIp: '', routerUsername: '', routerPassword: '' });

  const { data: hotspots, isLoading } = useQuery({
    queryKey: ['owner-hotspots'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.hotspots.list();
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiEndpoints.owner.hotspots.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hotspots'] });
      toast.success(t('hotspotCreated'));
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => apiEndpoints.owner.hotspots.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hotspots'] });
      toast.success(t('hotspotUpdated'));
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiEndpoints.owner.hotspots.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-hotspots'] });
      toast.success(t('hotspotDeleted'));
    },
  });

  function resetForm() {
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', address: '', routerType: '', routerIp: '', routerUsername: '', routerPassword: '' });
  }

  function handleEdit(hotspot: Record<string, unknown>) {
    setEditing(hotspot);
    setForm({
      name: hotspot.name as string,
      address: hotspot.address as string,
      routerType: hotspot.routerType as string,
      routerIp: hotspot.routerIp as string,
      routerUsername: hotspot.routerUsername as string,
      routerPassword: '',
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      const payload = { ...form };
      if (!form.routerPassword) delete payload.routerPassword;
      updateMutation.mutate({ id: editing._id as string, data: payload });
    } else {
      createMutation.mutate(form);
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
          <div className="h-10 w-32 rounded-lg bg-card animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('hotspots')}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addHotspot')}
        </Button>
      </div>

      {hotspots && hotspots.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {hotspots.map((hotspot: Record<string, unknown>) => (
            <Card key={hotspot._id as string} className="hover:border-primary/50 transition-colors group">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <Badge variant={hotspot.status === 'active' ? 'success' : 'warning'}>
                    {hotspot.status as string}
                  </Badge>
                </div>
                <h3 className="font-semibold text-lg mb-1">{hotspot.name as string}</h3>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5" />
                    {hotspot.address as string}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Router className="h-3.5 w-3.5" />
                    {hotspot.routerType as string}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(hotspot)}>
                    <Edit2 className="h-3.5 w-3.5 mr-1" />
                    {t('edit')}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      if (confirm(t('confirmDelete'))) {
                        deleteMutation.mutate(hotspot._id as string);
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
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wifi className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary mb-4">{t('noHotspots')}</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t('addHotspot')}
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editing ? t('editHotspot') : t('addHotspot')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <label className="block text-sm font-medium mb-1.5">{t('address')}</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('routerType')}</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.routerType}
                    onChange={(e) => setForm({ ...form, routerType: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('routerIp')}</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.routerIp}
                    onChange={(e) => setForm({ ...form, routerIp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('routerUsername')}</label>
                  <input
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.routerUsername}
                    onChange={(e) => setForm({ ...form, routerUsername: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('routerPassword')}</label>
                  <input
                    type="password"
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    value={form.routerPassword}
                    onChange={(e) => setForm({ ...form, routerPassword: e.target.value })}
                    placeholder={editing ? t('leaveBlankToKeep') : ''}
                  />
                </div>
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
