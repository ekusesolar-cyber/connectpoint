'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiEndpoints } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { BookOpen, Edit2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminSubscriptionsPage({ params: { locale } }: { params: { locale: string } }) {
  const queryClient = useQueryClient();
  const [editModal, setEditModal] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState({ plan: '', price: 0, hotspotLimit: 0, status: 'active' });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.subscriptions.list();
      return res.data.data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data: payload }: { id: string; data: Record<string, unknown> }) =>
      apiEndpoints.admin.subscriptions.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-subscriptions'] });
      toast.success('Subscription updated');
      setEditModal(null);
    },
  });

  const subscriptions = data?.subscriptions ?? data ?? [];

  function handleEdit(sub: Record<string, unknown>) {
    setEditModal(sub);
    setEditForm({
      plan: sub.plan as string,
      price: sub.price as number,
      hotspotLimit: sub.hotspotLimit as number,
      status: sub.status as string,
    });
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="h-72 rounded-xl bg-card animate-pulse" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Subscriptions</h1>

      <Card>
        <CardContent className="p-0">
          {subscriptions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="p-4 font-medium">Plan</th>
                    <th className="p-4 font-medium">Owner</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Hotspot Limit</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((sub: { _id: string; plan: string; owner?: { fullName: string; email: string }; price: number; currency?: string; hotspotLimit: number; status: string }) => (
                    <tr key={sub._id} className="border-b border-border/50 hover:bg-surface-hover/50 transition-colors">
                      <td className="p-4 font-medium">{sub.plan}</td>
                      <td className="p-4 text-text-secondary">
                        <div>{sub.owner?.fullName || 'N/A'}</div>
                        <div className="text-xs">{sub.owner?.email || ''}</div>
                      </td>
                      <td className="p-4">{formatCurrency(sub.price, sub.currency)}</td>
                      <td className="p-4">
                        <Badge variant="info" className="font-mono">{sub.hotspotLimit}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={sub.status === 'active' ? 'success' : sub.status === 'expired' ? 'destructive' : 'warning'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(sub)}>
                          <Edit2 className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-text-secondary mb-4" />
              <p className="text-text-secondary">No subscriptions found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Edit Subscription - {editModal.plan as string}</span>
                <button onClick={() => setEditModal(null)} className="text-text-secondary hover:text-text-primary">
                  <X className="h-5 w-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Plan Name</Label>
                  <Input
                    value={editForm.plan}
                    onChange={(e) => setEditForm({ ...editForm, plan: e.target.value })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Price</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) || 0 })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Hotspot Limit</Label>
                  <Input
                    type="number"
                    min="1"
                    value={editForm.hotspotLimit}
                    onChange={(e) => setEditForm({ ...editForm, hotspotLimit: parseInt(e.target.value) || 1 })}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1.5"
                    value={editForm.status}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <Button
                    onClick={() => updateMutation.mutate({ id: editModal._id as string, data: editForm })}
                    disabled={updateMutation.isPending}
                  >
                    <Save className="h-4 w-4 mr-1.5" />
                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
