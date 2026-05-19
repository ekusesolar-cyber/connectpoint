'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { Users, Wifi, Activity, DollarSign, Shield, UserCheck, ArrowUpRight, ListOrdered, BarChart3, BookOpen } from 'lucide-react';

export default function AdminDashboard({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.dashboard();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-56 rounded bg-card animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-card animate-pulse" />)}
        </div>
        <div className="h-10 w-72 rounded bg-card animate-pulse" />
        <div className="h-72 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  const stats = [
    { title: 'Total Owners', value: data?.stats?.totalOwners ?? 0, icon: <Users className="h-5 w-5" />, trend: { value: 5, positive: true } },
    { title: 'Total Hotspots', value: data?.stats?.totalHotspots ?? 0, icon: <Wifi className="h-5 w-5" />, trend: { value: 8, positive: true } },
    { title: 'Active Sessions', value: data?.stats?.activeSessions ?? 0, icon: <Activity className="h-5 w-5" />, trend: { value: 12, positive: true } },
    { title: 'Total Revenue', value: formatCurrency(data?.stats?.totalRevenue ?? 0), icon: <DollarSign className="h-5 w-5" />, trend: { value: 15, positive: true } },
    { title: 'Platform Fees', value: formatCurrency(data?.stats?.platformFees ?? 0), icon: <Shield className="h-5 w-5" />, trend: { value: 10, positive: true } },
    { title: 'Pending KYC', value: data?.stats?.pendingKyc ?? 0, icon: <UserCheck className="h-5 w-5" />, trend: { value: 3, positive: false } },
  ];

  const quickActions = [
    { label: 'Owners', href: `/${locale}/admin/owners`, icon: <Users className="h-4 w-4" /> },
    { label: 'KYC Reviews', href: `/${locale}/admin/kyc`, icon: <UserCheck className="h-4 w-4" /> },
    { label: 'Transactions', href: `/${locale}/admin/transactions`, icon: <ListOrdered className="h-4 w-4" /> },
    { label: 'Analytics', href: `/${locale}/admin/analytics`, icon: <BarChart3 className="h-4 w-4" /> },
    { label: 'Subscriptions', href: `/${locale}/admin/subscriptions`, icon: <BookOpen className="h-4 w-4" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <p className="text-sm text-text-secondary font-medium mr-2">Quick Actions:</p>
        {quickActions.map((action) => (
          <Button key={action.label} variant="outline" size="sm" onClick={() => router.push(action.href)}>
            {action.icon}
            <span className="ml-1.5">{action.label}</span>
            <ArrowUpRight className="h-3 w-3 ml-1" />
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentTransactions && data.recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="pb-3 pr-4 font-medium">Reference</th>
                    <th className="pb-3 pr-4 font-medium">Owner</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentTransactions.map((tx: { _id: string; reference: string; owner?: { fullName: string }; amount: number; currency: string; status: string; createdAt: string }) => (
                    <tr key={tx._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="py-3 pr-4 font-mono text-xs">{tx.reference}</td>
                      <td className="py-3 pr-4">{tx.owner?.fullName || 'N/A'}</td>
                      <td className="py-3 pr-4 font-medium">{formatCurrency(tx.amount, tx.currency)}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'destructive' : 'warning'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-text-secondary text-xs">{formatDateTime(tx.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-8">No recent transactions</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
