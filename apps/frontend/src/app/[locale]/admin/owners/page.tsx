'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import api, { apiEndpoints } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Search, Users, Shield, ShieldOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOwnersPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-owners', search],
    queryFn: async () => {
      const res = await apiEndpoints.admin.owners.list({ search: search || undefined });
      return res.data.data;
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (ownerId: string) => {
      const res = await api.put(`/admin/owners/${ownerId}/toggle-status`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owners'] });
      toast.success('Owner status updated');
    },
  });

  const owners = data?.owners ?? data ?? [];

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-10 rounded-lg bg-card animate-pulse" />
        <div className="h-72 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hotspot Owners</h1>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <Input
          placeholder="Search by name, email or phone..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {owners.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="p-4 font-medium">Name</th>
                    <th className="p-4 font-medium">Email</th>
                    <th className="p-4 font-medium">Phone</th>
                    <th className="p-4 font-medium">Hotspots</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {owners.map((owner: { _id: string; fullName: string; email: string; phone?: string; hotspotsCount?: number; status: string; createdAt: string }) => (
                    <tr
                      key={owner._id}
                      className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/${locale}/admin/owners/${owner._id}`)}
                    >
                      <td className="p-4 font-medium">{owner.fullName}</td>
                      <td className="p-4 text-text-secondary">{owner.email}</td>
                      <td className="p-4 text-text-secondary">{owner.phone || '—'}</td>
                      <td className="p-4">
                        <Badge variant="info" className="font-mono">{owner.hotspotsCount ?? 0}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={owner.status === 'active' ? 'success' : owner.status === 'suspended' ? 'destructive' : 'warning'}>
                          {owner.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-text-secondary text-xs">{formatDate(owner.createdAt)}</td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStatusMutation.mutate(owner._id);
                          }}
                        >
                          {owner.status === 'suspended' ? (
                            <><ShieldOff className="h-3.5 w-3.5 mr-1" /> Unsuspend</>
                          ) : (
                            <><Shield className="h-3.5 w-3.5 mr-1" /> Suspend</>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <Users className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">{search ? 'No owners match your search' : 'No owners registered yet'}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
