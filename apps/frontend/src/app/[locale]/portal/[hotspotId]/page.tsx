'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Wifi, Ticket, CreditCard, Clock, Database, Check, AlertCircle, ChevronRight, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDuration, formatBytes } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function PortalPage({
  params: { locale, hotspotId },
  searchParams,
}: {
  params: { locale: string; hotspotId: string };
  searchParams?: { mac?: string; redirect?: string };
}) {
  const router = useRouter();
  const [tab, setTab] = useState<'voucher' | 'buy'>('voucher');
  const [code, setCode] = useState('');
  const [pin, setPin] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [macAddress, setMacAddress] = useState('');

  useEffect(() => {
    if (searchParams?.mac) {
      setMacAddress(searchParams.mac);
    }
  }, [searchParams]);

  const { data: info, isLoading: infoLoading } = useQuery({
    queryKey: ['portal-info', hotspotId],
    queryFn: async () => {
      const res = await apiEndpoints.portal.info(hotspotId);
      return res.data.data;
    },
  });

  const { data: packages, isLoading: packagesLoading } = useQuery({
    queryKey: ['portal-packages', hotspotId],
    queryFn: async () => {
      const res = await apiEndpoints.portal.packages(hotspotId);
      return res.data.data;
    },
  });

  const voucherMutation = useMutation({
    mutationFn: (data: { code: string; pin?: string; macAddress?: string }) =>
      apiEndpoints.portal.voucherLogin(hotspotId, data),
    onSuccess: (res) => {
      const sessionId = res.data.data?.sessionId || res.data.data?._id;
      if (sessionId) {
        router.push(`/${locale}/portal/${hotspotId}/success?sessionId=${sessionId}`);
      } else {
        toast.success('Connected successfully!');
        if (searchParams?.redirect) {
          window.location.href = searchParams.redirect;
        }
      }
    },
  });

  const purchaseMutation = useMutation({
    mutationFn: (data: { packageId: string; redirectUrl?: string }) =>
      apiEndpoints.payments.initialize({
        ...data,
        hotspotId,
        metadata: { hotspotId },
      }),
    onSuccess: (res) => {
      const authorizationUrl = res.data.data?.authorizationUrl || res.data.data?.redirectUrl;
      if (authorizationUrl) {
        window.location.href = authorizationUrl;
      } else {
        toast.success('Purchase initiated');
      }
    },
  });

  function handleVoucherConnect(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      toast.error('Please enter a voucher code');
      return;
    }
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    voucherMutation.mutate({ code: code.trim(), pin: pin.trim() || undefined, macAddress: macAddress || undefined });
  }

  function handlePackageSelect(packageId: string) {
    if (!acceptedTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }
    purchaseMutation.mutate({
      packageId,
      redirectUrl: `${window.location.origin}/${locale}/portal/${hotspotId}/success`,
    });
  }

  if (infoLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Wifi className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            <Wifi className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-1">{info?.hotspotName || info?.name || 'WiFi Hotspot'}</h1>
          {info?.address && (
            <p className="text-sm text-text-secondary flex items-center justify-center gap-1">
              <Globe className="h-3.5 w-3.5" />
              {info.address}
            </p>
          )}
        </div>

        <div className="flex rounded-xl bg-surface p-1 mb-6">
          <button
            onClick={() => setTab('voucher')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'voucher' ? 'bg-primary text-black shadow-lg' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Ticket className="h-4 w-4" />
            Voucher
          </button>
          <button
            onClick={() => setTab('buy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'buy' ? 'bg-primary text-black shadow-lg' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <CreditCard className="h-4 w-4" />
            Buy Package
          </button>
        </div>

        {tab === 'voucher' ? (
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleVoucherConnect} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Voucher Code</label>
                  <Input
                    placeholder="Enter your voucher code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="text-center text-lg tracking-widest font-mono"
                    autoComplete="off"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">PIN (optional)</label>
                  <Input
                    type="password"
                    placeholder="Enter PIN if required"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="text-center"
                    maxLength={6}
                  />
                </div>
                {macAddress && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-surface-hover">
                    <Database className="h-4 w-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary">Device: {macAddress}</span>
                  </div>
                )}
                <Separator />
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary"
                  />
                  <span className="text-xs text-text-secondary">
                    I accept the <button type="button" className="text-primary hover:underline">Terms and Conditions</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
                  </span>
                </label>
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={voucherMutation.isPending || !code.trim()}
                >
                  {voucherMutation.isPending ? 'Connecting...' : 'Connect'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {packagesLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />
              ))
            ) : packages && packages.length > 0 ? (
              packages.map((pkg: { _id: string; name: string; price: number; currency?: string; duration?: number; dataLimit?: number; speedLimit?: number; description?: string }) => (
                <Card
                  key={pkg._id}
                  className="hover:border-primary/50 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => handlePackageSelect(pkg._id)}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-lg">{pkg.name}</h3>
                      <span className="text-xl font-bold text-primary">{formatCurrency(pkg.price, pkg.currency)}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary">
                      {pkg.duration ? (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {formatDuration(pkg.duration)}
                        </span>
                      ) : null}
                      {pkg.dataLimit ? (
                        <span className="flex items-center gap-1">
                          <Database className="h-3.5 w-3.5" />
                          {formatBytes(pkg.dataLimit)}
                        </span>
                      ) : null}
                      {pkg.speedLimit ? (
                        <span className="flex items-center gap-1">
                          <Wifi className="h-3.5 w-3.5" />
                          {pkg.speedLimit} Mbps
                        </span>
                      ) : null}
                    </div>
                    {pkg.description && (
                      <p className="text-xs text-text-secondary mt-2">{pkg.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CreditCard className="h-10 w-10 text-text-secondary mb-3" />
                  <p className="text-text-secondary text-sm">No packages available</p>
                </CardContent>
              </Card>
            )}

            <Separator className="my-4" />

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary"
              />
              <span className="text-xs text-text-secondary">
                I accept the <button type="button" className="text-primary hover:underline">Terms and Conditions</button> and <button type="button" className="text-primary hover:underline">Privacy Policy</button>
              </span>
            </label>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-xs text-text-secondary">
            Powered by <span className="text-primary font-semibold">ConnectPoint</span>
          </p>
        </div>
      </div>
    </div>
  );
}
