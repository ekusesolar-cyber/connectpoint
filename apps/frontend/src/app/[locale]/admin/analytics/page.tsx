'use client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiEndpoints } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#eab308', '#22c55e', '#3b82f6', '#ef4444', '#a855f7', '#f97316'];

export default function AdminAnalyticsPage({ params: { locale } }: { params: { locale: string } }) {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.analytics();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="grid gap-6 lg:grid-cols-2">
          {[...Array(4)].map((_, i) => <div key={i} className="h-72 rounded-xl bg-card animate-pulse" />)}
        </div>
      </div>
    );
  }

  const registrationsData = data?.ownerRegistrations ?? data?.registrations ?? [];
  const transactionsByStatus = data?.transactionsByStatus ?? data?.statusBreakdown ?? [];
  const hotspotsDistribution = data?.hotspotsDistribution ?? data?.hotspotsPerOwner ?? [];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Analytics</h1>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Owner Registrations Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {registrationsData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={registrationsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#131829', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="count" fill="#eab308" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-text-secondary text-center py-12">No registration data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transactions by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsByStatus.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={transactionsByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ status, count }) => `${status}: ${count}`}
                    >
                      {transactionsByStatus.map((_: unknown, idx: number) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#131829', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-text-secondary text-center py-12">No transaction data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Hotspots Per Owner Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {hotspotsDistribution.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hotspotsDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ background: '#131829', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="owners" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-text-secondary text-center py-12">No distribution data</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.summary ? (
                Object.entries(data.summary).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <span className="text-sm text-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="font-semibold">{val as string}</span>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary text-center py-8">No summary data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
