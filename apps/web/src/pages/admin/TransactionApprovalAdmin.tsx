import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveAdminWithdrawal,
  fetchAdminWithdrawals,
  rejectAdminWithdrawal,
} from '../../lib/api';

const money = (value: number | string) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value));

export const TransactionApprovalAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: withdrawals = [] } = useQuery({
    queryKey: ['admin', 'withdrawals'],
    queryFn: fetchAdminWithdrawals,
    refetchInterval: 15_000,
  });

  const approveMutation = useMutation({
    mutationFn: approveAdminWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectAdminWithdrawal,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] }),
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Transaction approval</h1>
        <p className="mt-1 text-muted-foreground">
          Approve pending withdrawals or reject and refund them.
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full min-w-[880px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Amount</th>
              <th className="px-5 py-3">Platform</th>
              <th className="px-5 py-3">Account</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {withdrawals.map((withdrawal) => (
              <tr key={withdrawal.id}>
                <td className="px-5 py-4 text-xs">{withdrawal.user_id}</td>
                <td className="px-5 py-4 font-medium">{money(withdrawal.amount)}</td>
                <td className="px-5 py-4">
                  {String(withdrawal.metadata?.platform ?? '-').toUpperCase()}
                </td>
                <td className="px-5 py-4">{String(withdrawal.metadata?.account ?? '-')}</td>
                <td className="px-5 py-4 capitalize">{withdrawal.status}</td>
                <td className="px-5 py-4">
                  {withdrawal.status === 'pending' ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => approveMutation.mutate(withdrawal.id)}
                        className="rounded-lg bg-primary px-3 py-2 font-semibold text-primary-foreground"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => rejectMutation.mutate(withdrawal.id)}
                        className="rounded-lg border border-border px-3 py-2 font-semibold hover:bg-accent"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};
