'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { User, Mail, Shield, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiEndpoints } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ fullName: '', phone: '' });

  const { data: user, isLoading } = useQuery({
    queryKey: ['auth-me'],
    queryFn: async () => {
      const res = await apiEndpoints.auth.me();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (user) {
      setForm({ fullName: user.fullName || '', phone: user.phone || '' });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: { fullName?: string; phone?: string }) => apiEndpoints.owner.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth-me'] });
      toast.success(t('profileUpdated'));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateMutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-64 rounded-xl bg-card animate-pulse" />
        <div className="h-48 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('profile')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('accountInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <Mail className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">{t('email')}</p>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <Shield className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">{t('role')}</p>
              <p className="text-sm font-medium capitalize">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-surface/50">
            <Calendar className="h-5 w-5 text-text-secondary" />
            <div>
              <p className="text-xs text-text-secondary">{t('memberSince')}</p>
              <p className="text-sm font-medium">{user?.createdAt ? formatDate(user.createdAt) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('editProfile')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">{t('fullName')}</Label>
              <Input
                id="fullName"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {t('saveChanges')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
