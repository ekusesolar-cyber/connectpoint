'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { DollarSign, TrendingUp, Wallet, Banknote, ArrowUpRight } from 'lucide-react';
import { StatsCard } from '@/components/ui/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenuePage({ params: { locale } }: { params: { locale: string } }) {
  const t = useTranslations('dashboard');
  const [txPage, setTxPage] = useState(1);

  const { data: revenueData, isLoading: revLoading } = useQuery({
    queryKey: ['owner-revenue', 30],
    queryFn: async () => {
      const res = await apiEndpoints.owner.revenue(30);
      return res.data.data;
    },
  });

  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['owner-transactions', txPage],
    queryFn: async () => {
      const res = await apiEndpoints.owner.transactions(txPage);
      return res.data;
    },
  });

  const summaryStats = [
    {
      title: t('totalRevenue'),
      value: formatCurrency(revenueData?.totalRevenue ?? 0),
      icon: <DollarSign className="h-5 w-5" />,
      trend: { value: 12, positive: true },
    },
    {
      title: t('todayRevenue'),
      value: formatCurrency(revenueData?.todayRevenue ?? 0),
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: t('thisMonth'),
      value: formatCurrency(revenueData?.monthRevenue ?? 0),
      icon: <Wallet className="h-5 w-5" />,
    },
    {
      title: t('afterCommission'),
      value: formatCurrency(revenueData?.netRevenue ?? 0),
      icon: <Banknote className="h-5 w-5" />,
    },
  ];

  const transactions = txData?.data ?? [];
  const totalTxPages = txData?.totalPages ?? 1;

  if (revLoading || txLoading) {
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('revenue')}</h1>
        <Button>
          <ArrowUpRight className="h-4 w-4 mr-2" />
          {t('requestWithdrawal')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryStats.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('dailyRevenue')}</CardTitle>
        </CardHeader>
        <CardContent>
          {revenueData?.daily && revenueData.daily.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData.daily}>
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
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="amount" fill="#eab308" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-text-secondary text-center py-16">{t('noRevenueData')}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('recentTransactions')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {transactions.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('date')}</th>
                      <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('description')}</th>
                      <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('amount')}</th>
                      <th className="text-left p-4 text-xs font-medium text-text-secondary uppercase tracking-wider">{t('status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx: Record<string, unknown>) => (
                      <tr key={tx._id as string} className="border-b border-border/50 hover:bg-surface/50 transition-colors">
                        <td className="p-4 text-sm text-text-secondary">{formatDateTime(tx.createdAt as string)}</td>
                        <td className="p-4 text-sm">{tx.description as string}</td>
                        <td className="p-4 text-sm font-medium">{formatCurrency(Number(tx.amount))}</td>
                        <td className="p-4">
                          <Badge variant={tx.status === 'success' ? 'success' : tx.status === 'failed' ? 'destructive' : 'warning'}>
                            {tx.status as string}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {totalTxPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-border">
                  <Button variant="outline" size="sm" disabled={txPage <= 1} onClick={() => setTxPage(txPage - 1)}>
                    {t('previous')}
                  </Button>
                  <span className="text-sm text-text-secondary">{t('page', { page: txPage, total: totalTxPages })}</span>
                  <Button variant="outline" size="sm" disabled={txPage >= totalTxPages} onClick={() => setTxPage(txPage + 1)}>
                    {t('next')}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <DollarSign className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">{t('noTransactions')}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
