'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Tabs from '@radix-ui/react-tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { apiEndpoints } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { UserCheck, X, Check, AlertCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminKycPage({ params: { locale } }: { params: { locale: string } }) {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState('pending');
  const [rejectModal, setRejectModal] = useState<{ id: string; businessName: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data: pendingData, isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-kyc-pending'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.kyc.pending();
      return res.data.data;
    },
    enabled: tab === 'pending',
  });

  const { data: allData, isLoading: allLoading } = useQuery({
    queryKey: ['admin-kyc-all'],
    queryFn: async () => {
      const res = await apiEndpoints.admin.kyc.pending();
      return res.data.data;
    },
    enabled: tab === 'all',
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => apiEndpoints.admin.kyc.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
      toast.success('KYC approved successfully');
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => apiEndpoints.admin.kyc.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-pending'] });
      toast.success('KYC rejected');
      setRejectModal(null);
      setRejectReason('');
    },
  });

  const items = tab === 'pending' ? pendingData : allData;
  const isLoading = tab === 'pending' ? pendingLoading : allLoading;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">KYC Verification</h1>

      <Tabs.Root value={tab} onValueChange={setTab}>
        <Tabs.List className="flex gap-1 border-b border-border mb-6">
          <Tabs.Trigger
            value="pending"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
          >
            Pending
          </Tabs.Trigger>
          <Tabs.Trigger
            value="all"
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary transition-colors"
          >
            All
          </Tabs.Trigger>
        </Tabs.List>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : items && items.length > 0 ? (
          <div className="space-y-4">
            {items.map((kyc: { _id: string; businessName: string; businessType?: string; registrationNumber?: string; address?: string; owner?: { fullName: string; email: string }; documents?: { type: string; url: string }[]; status: string; createdAt: string }) => (
              <Card key={kyc._id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-lg">{kyc.businessName}</h3>
                        <Badge variant={kyc.status === 'approved' ? 'success' : kyc.status === 'rejected' ? 'destructive' : 'warning'}>
                          {kyc.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-text-secondary">
                        {kyc.owner?.fullName} · {kyc.owner?.email}
                      </p>
                      {kyc.businessType && (
                        <p className="text-xs text-text-secondary mt-1">
                          {kyc.businessType}{kyc.registrationNumber ? ` · Reg: ${kyc.registrationNumber}` : ''}
                        </p>
                      )}
                      {kyc.address && <p className="text-xs text-text-secondary">{kyc.address}</p>}
                      <p className="text-xs text-text-secondary mt-1">Submitted {formatDate(kyc.createdAt)}</p>
                    </div>
                  </div>

                  {kyc.documents && kyc.documents.length > 0 && (
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-text-secondary" />
                      <span className="text-xs text-text-secondary">Documents:</span>
                      {kyc.documents.map((doc, idx) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline"
                        >
                          {doc.type}
                        </a>
                      ))}
                    </div>
                  )}

                  {kyc.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <Button
                        size="sm"
                        onClick={() => approveMutation.mutate(kyc._id)}
                        disabled={approveMutation.isPending}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setRejectModal({ id: kyc._id, businessName: kyc.businessName })}
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <UserCheck className="h-12 w-12 text-text-secondary mb-4" />
            <p className="text-text-secondary">No {tab} KYC submissions</p>
          </div>
        )}
      </Tabs.Root>

      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-danger" />
                Reject KYC - {rejectModal.businessName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="reason">Reason for rejection</Label>
                  <textarea
                    id="reason"
                    className="flex min-h-[100px] w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder:text-text-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary mt-1.5"
                    placeholder="Provide a reason..."
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="destructive"
                    onClick={() => rejectMutation.mutate({ id: rejectModal.id, reason: rejectReason })}
                    disabled={!rejectReason.trim() || rejectMutation.isPending}
                  >
                    Reject
                  </Button>
                  <Button variant="ghost" onClick={() => { setRejectModal(null); setRejectReason(''); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
