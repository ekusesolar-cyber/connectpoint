'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Shield, CheckCircle2, Clock, AlertCircle, Building2, MapPin, FileText, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiEndpoints } from '@/lib/api';
import toast from 'react-hot-toast';

export default function KycPage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ businessName: '', businessType: '', address: '', idNumber: '' });

  const { data: kyc, isLoading } = useQuery({
    queryKey: ['owner-kyc'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.kyc.get();
      return res.data.data;
    },
  });

  const submitMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => apiEndpoints.owner.kyc.submit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-kyc'] });
      toast.success(t('kycSubmitted'));
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submitMutation.mutate(form);
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-64 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  const status = kyc?.status || 'not_submitted';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('kycVerification')}</h1>

      {status === 'approved' && (
        <Card className="border-secondary/30 bg-secondary/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-secondary/20">
              <CheckCircle2 className="h-8 w-8 text-secondary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-secondary">{t('kycApproved')}</h2>
              <p className="text-sm text-text-secondary">{t('kycApprovedMessage')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'pending' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/20">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-primary">{t('kycPending')}</h2>
              <p className="text-sm text-text-secondary">{t('kycPendingMessage')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'rejected' && (
        <Card className="border-danger/30 bg-danger/5">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-danger/20">
              <AlertCircle className="h-8 w-8 text-danger" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-danger">{t('kycRejected')}</h2>
              <p className="text-sm text-text-secondary">{kyc?.reason || t('kycRejectedMessage')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {status === 'not_submitted' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('submitKyc')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">{t('businessName')}</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="businessName"
                    className="pl-10"
                    value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">{t('businessType')}</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="businessType"
                    className="pl-10"
                    value={form.businessType}
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="address"
                    className="pl-10"
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">{t('idNumber')}</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                  <Input
                    id="idNumber"
                    className="pl-10"
                    value={form.idNumber}
                    onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                    required
                  />
                </div>
              </div>
              <Button type="submit" disabled={submitMutation.isPending}>
                {t('submit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {status === 'rejected' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('resubmitKyc')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">{t('businessName')}</Label>
                <Input
                  id="businessName"
                  defaultValue={kyc?.businessName}
                  onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessType">{t('businessType')}</Label>
                <Input
                  id="businessType"
                  defaultValue={kyc?.businessType}
                  onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t('address')}</Label>
                <Input
                  id="address"
                  defaultValue={kyc?.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="idNumber">{t('idNumber')}</Label>
                <Input
                  id="idNumber"
                  defaultValue={kyc?.idNumber}
                  onChange={(e) => setForm({ ...form, idNumber: e.target.value })}
                  required
                />
              </div>
              <Button type="submit" disabled={submitMutation.isPending}>
                {t('resubmit')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
