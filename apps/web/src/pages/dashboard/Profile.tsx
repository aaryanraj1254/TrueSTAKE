import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Target, TrendingUp, WalletCards } from 'lucide-react';
import { fetchProfileStats } from '../../lib/api';
import { useAuth } from '../../hooks/useAuth';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { data } = useQuery({
    queryKey: ['dashboard', 'profile'],
    queryFn: fetchProfileStats,
    refetchInterval: 30_000,
  });

  const cards = [
    { label: 'Total traded', value: money(data?.totalTraded ?? 0), icon: WalletCards },
    { label: 'Win rate', value: `${(data?.winRate ?? 0).toFixed(1)}%`, icon: Target },
    { label: 'Profit', value: money(data?.profit ?? 0), icon: TrendingUp },
    { label: 'Trades placed', value: String(data?.tradesPlaced ?? 0), icon: Activity },
  ];

  return (
    <main className="space-y-6">
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight">
          {user?.username || user?.email || 'Trader'}
        </h1>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-secondary">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="mt-2 text-xl font-bold">{card.value}</p>
            </div>
          );
        })}
      </section>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">Pending withdrawals</p>
        <p className="mt-2 text-2xl font-bold">{money(data?.pendingWithdrawals ?? 0)}</p>
      </div>
    </main>
  );
};
