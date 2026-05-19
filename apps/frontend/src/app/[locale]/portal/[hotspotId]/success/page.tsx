'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Wifi, Clock, Database, User, Package, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiEndpoints } from '@/lib/api';
import { formatDuration, formatBytes } from '@/lib/utils';

export default function PortalSuccessPage({
  params: { locale, hotspotId },
  searchParams,
}: {
  params: { locale: string; hotspotId: string };
  searchParams: { sessionId?: string; reference?: string };
}) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['portal-session', hotspotId, searchParams.sessionId],
    queryFn: async () => {
      if (!searchParams.sessionId) return null;
      const res = await apiEndpoints.portal.sessionStatus(hotspotId, searchParams.sessionId);
      return res.data.data;
    },
    enabled: !!searchParams.sessionId,
    refetchInterval: 10000,
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8 w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-secondary/10 mb-4 animate-[scaleUp_0.5s_ease-out]">
            <CheckCircle className="h-10 w-10 text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-secondary animate-[fadeIn_0.5s_ease-out_0.2s_both]">
            Connected Successfully!
          </h1>
          <p className="text-text-secondary mt-1 animate-[fadeIn_0.5s_ease-out_0.3s_both]">
            You are now connected to the WiFi network
          </p>
        </div>

        <style jsx global>{`
          @keyframes scaleUp {
            0% { transform: scale(0); }
            60% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        {isLoading ? (
          <Card className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-surface-hover" />
              ))}
            </CardContent>
          </Card>
        ) : data ? (
          <Card className="animate-[fadeIn_0.5s_ease-out_0.4s_both]">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {data.packageName || 'Session'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.username && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover">
                  <User className="h-5 w-5 text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Username</p>
                    <p className="font-medium">{data.username}</p>
                  </div>
                </div>
              )}
              {data.remainingTime !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover">
                  <Clock className="h-5 w-5 text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Remaining Time</p>
                    <p className="font-medium">{formatDuration(data.remainingTime)}</p>
                  </div>
                </div>
              )}
              {data.remainingData !== undefined && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover">
                  <Database className="h-5 w-5 text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Remaining Data</p>
                    <p className="font-medium">{formatBytes(data.remainingData)}</p>
                  </div>
                </div>
              )}
              {data.packageName && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-hover">
                  <Package className="h-5 w-5 text-text-secondary" />
                  <div>
                    <p className="text-xs text-text-secondary">Package</p>
                    <p className="font-medium">{data.packageName}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : searchParams.reference && !searchParams.sessionId ? (
          <Card className="animate-[fadeIn_0.5s_ease-out_0.4s_both]">
            <CardContent className="p-6 text-center">
              <p className="text-text-secondary">Payment completed. Session info will appear once connected.</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="animate-[fadeIn_0.5s_ease-out_0.4s_both]">
            <CardContent className="p-6 text-center">
              <Wifi className="h-10 w-10 text-text-secondary mx-auto mb-3" />
              <p className="text-text-secondary">You are connected to the WiFi network.</p>
            </CardContent>
          </Card>
        )}

        <div className="mt-6 text-center animate-[fadeIn_0.5s_ease-out_0.6s_both]">
          <Button
            variant="outline"
            onClick={() => router.push(`/${locale}/portal/${hotspotId}`)}
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Extend
          </Button>
        </div>

        <div className="mt-8 text-center animate-[fadeIn_0.5s_ease-out_0.7s_both]">
          <p className="text-xs text-text-secondary">
            Powered by <span className="text-primary font-semibold">ConnectPoint</span>
          </p>
        </div>
      </div>
    </div>
  );
}
