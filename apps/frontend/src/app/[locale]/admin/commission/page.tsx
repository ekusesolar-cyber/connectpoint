'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiEndpoints } from '@/lib/api';
import { DollarSign, Percent, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminCommissionPage({ params: { locale } }: { params: { locale: string } }) {
  const queryClient = useQueryClient();
  const [rate, setRate] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-commission'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.commission.get();
      return res.data.data;
    },
  });

  useEffect(() => {
    if (data?.commission !== undefined && !isEditing) {
      setRate(String(data.commission));
    }
  }, [data, isEditing]);

  const setMutation = useMutation({
    mutationFn: (commission: number) => apiEndpoints.admin.commission.set(commission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-commission'] });
      toast.success('Commission rate updated');
      setIsEditing(false);
    },
  });

  const currentRate = data?.commission ?? data?.rate ?? 0;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 w-48 rounded bg-card animate-pulse" />
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-44 rounded-xl bg-card animate-pulse" />
          <div className="h-44 rounded-xl bg-card animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Platform Commission</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Percent className="h-5 w-5 text-primary" />
              Current Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl font-bold text-primary">{currentRate}%</span>
            </div>
            <p className="text-sm text-text-secondary">
              This commission is deducted from each transaction on the platform.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Update Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <div className="flex items-center gap-2 mt-1.5">
                  <Input
                    id="commissionRate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="max-w-[160px]"
                  />
                  <span className="text-text-secondary">%</span>
                </div>
              </div>
              <Button
                onClick={() => {
                  const val = parseFloat(rate);
                  if (isNaN(val) || val < 0 || val > 100) {
                    toast.error('Enter a valid rate between 0 and 100');
                    return;
                  }
                  setMutation.mutate(val);
                }}
                disabled={setMutation.isPending}
              >
                <Save className="h-4 w-4 mr-1.5" />
                {setMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
