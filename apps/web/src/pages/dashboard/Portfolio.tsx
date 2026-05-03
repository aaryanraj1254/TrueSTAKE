import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchPortfolio } from '../../lib/api';
import { TableSkeleton } from '../../components/Skeleton';

const money = (value: number | string | null | undefined) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value ?? 0));

export const Portfolio: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'portfolio'],
    queryFn: fetchPortfolio,
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <main className="space-y-6">
        <TableSkeleton rows={4} columns={4} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Portfolio</h1>
        <p className="mt-1 text-muted-foreground">
          Your trades, realized payouts, and current P&L.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total staked</p>
          <p className="mt-2 text-xl font-bold">{money(data?.summary.totalStaked)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Payouts</p>
          <p className="mt-2 text-xl font-bold">{money(data?.summary.realizedPayout)}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">P&L</p>
          <p
            className={`mt-2 text-xl font-bold ${Number(data?.summary.pnl ?? 0) >= 0 ? 'text-green-700' : 'text-red-700'}`}
          >
            {money(data?.summary.pnl)}
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs text-muted-foreground">Open trades</p>
          <p className="mt-2 text-xl font-bold">{data?.summary.openTrades ?? 0}</p>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Market</th>
              <th className="px-5 py-3">Pick</th>
              <th className="px-5 py-3">Stake</th>
              <th className="px-5 py-3">Payout</th>
              <th className="px-5 py-3">Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(data?.trades ?? []).map((trade) => (
              <tr key={trade.id}>
                <td className="px-5 py-4 font-medium">{trade.market?.title ?? 'Market'}</td>
                <td className="px-5 py-4 text-muted-foreground">{trade.option?.label ?? '-'}</td>
                <td className="px-5 py-4">{money(trade.amount)}</td>
                <td className="px-5 py-4">{money(trade.payout)}</td>
                <td className="px-5 py-4 capitalize">{trade.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};
