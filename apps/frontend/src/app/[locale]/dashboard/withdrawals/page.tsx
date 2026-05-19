'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Wallet, Plus, Banknote, Building2, User, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function WithdrawalsPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ bankName: '', accountNumber: '', accountName: '', amount: '' });

  const { data: revenue } = useQuery({
    queryKey: ['owner-revenue', 30],
    queryFn: async () => {
      const res = await apiEndpoints.owner.revenue(30);
      return res.data.data;
    },
  });

  const { data: withdrawals, isLoading } = useQuery({
    queryKey: ['owner-withdrawals'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.withdrawals.list();
      return res.data.data;
    },
  });

  const requestMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiEndpoints.owner.withdrawals.request(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-withdrawals'] });
      toast.success(t('withdrawalRequested'));
      setShowForm(false);
      setForm({ bankName: '', accountNumber: '', accountName: '', amount: '' });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    requestMutation.mutate({
      bankName: form.bankName,
      accountNumber: form.accountNumber,
      accountName: form.accountName,
      amount: Number(form.amount),
    });
  }

  const availableBalance = revenue?.netRevenue ?? 0;

  const statusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'default'> = {
    approved: 'success',
    pending: 'warning',
    rejected: 'destructive',
    completed: 'success',
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-28 rounded-xl bg-card animate-pulse" />
        <div className="flex justify-between items-center">
          <div className="h-8 w-48 rounded bg-card animate-pulse" />
          <div className="h-10 w-48 rounded-lg bg-card animate-pulse" />
        </div>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-20 rounded-xl bg-card animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-text-secondary mb-1">{t('availableBalance')}</p>
            <p className="text-3xl font-bold">{formatCurrency(availableBalance)}</p>
          </div>
          <Wallet className="h-12 w-12 text-primary opacity-50" />
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('withdrawals')}</h1>
        <Button onClick={() => setShowForm(true)} disabled={availableBalance <= 0}>
          <Plus className="h-4 w-4 mr-2" />
          {t('newWithdrawalRequest')}
        </Button>
      </div>

      {withdrawals && withdrawals.length > 0 ? (
        <div className="space-y-3">
          {withdrawals.map((w: Record<string, unknown>) => (
            <Card key={w._id as string}>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-lg">{formatCurrency(Number(w.amount))}</p>
                    <Badge variant={statusVariant[w.status as string] || 'default'}>
                      {w.status as string}
                    </Badge>
                  </div>
                  <p className="text-sm text-text-secondary">
                    {w.bankName as string} - {w.accountName as string} ({w.accountNumber as string})
                  </p>
                  <p className="text-xs text-text-secondary mt-1">{formatDateTime(w.createdAt as string)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Banknote className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary mb-4">{t('noWithdrawals')}</p>
            <Button onClick={() => setShowForm(true)} disabled={availableBalance <= 0}>
              <Plus className="h-4 w-4 mr-2" />
              {t('newWithdrawalRequest')}
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{t('newWithdrawalRequest')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('bankName')}</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      className="pl-10"
                      value={form.bankName}
                      onChange={(e) => setForm({ ...form, bankName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('accountNumber')}</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      className="pl-10"
                      value={form.accountNumber}
                      onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('accountName')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      className="pl-10"
                      value={form.accountName}
                      onChange={(e) => setForm({ ...form, accountName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">{t('amount')}</label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                    <Input
                      type="number"
                      className="pl-10"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      required
                      min="1"
                      max={availableBalance}
                    />
                  </div>
                  <p className="text-xs text-text-secondary mt-1">{t('maxWithdraw', { amount: formatCurrency(availableBalance) })}</p>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={requestMutation.isPending}>
                    {t('submit')}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
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
