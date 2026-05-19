'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Wifi, Users, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function OwnerDashboard({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      const res = await apiEndpoints.owner.dashboard();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />
          ))}
        </div>
        <div className="h-80 rounded-xl bg-card animate-pulse" />
        <div className="h-64 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  const stats = [
    {
      title: t('totalHotspots'),
      value: data?.stats?.totalHotspots ?? 0,
      icon: <Wifi className="h-5 w-5" />,
      trend: { value: 12, positive: true },
    },
    {
      title: t('activeUsers'),
      value: data?.stats?.activeUsers ?? 0,
      icon: <Users className="h-5 w-5" />,
      trend: { value: 8, positive: true },
    },
    {
      title: t('totalRevenue'),
      value: formatCurrency(data?.stats?.totalRevenue ?? 0),
      icon: <DollarSign className="h-5 w-5" />,
      trend: { value: 15, positive: true },
    },
    {
      title: t('totalCustomers'),
      value: data?.stats?.totalCustomers ?? 0,
      icon: <Activity className="h-5 w-5" />,
      trend: { value: 5, positive: false },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t('dashboard')}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('revenueLast7Days')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.revenueLast7Days && data.revenueLast7Days.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.revenueLast7Days}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: '#131829',
                        border: '1px solid #1e293b',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#eab308" strokeWidth={2} dot={{ fill: '#eab308' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-text-secondary text-center py-12">{t('noRevenueData')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('activeUsers')}</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentSessions && data.recentSessions.length > 0 ? (
              <div className="space-y-3">
                {data.recentSessions.slice(0, 5).map((session: { id: string; username: string; packageName: string; timeUsed: number; dataUsed: number }) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-surface/50 hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => router.push(`/${locale}/dashboard/users`)}
                  >
                    <div>
                      <p className="font-medium text-sm">{session.username}</p>
                      <p className="text-xs text-text-secondary">{session.packageName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-text-secondary">{Math.floor(session.timeUsed / 60)}m used</p>
                      <p className="text-xs text-text-secondary">{(session.dataUsed / 1048576).toFixed(1)} MB</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary text-center py-12">{t('noActiveUsers')}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
