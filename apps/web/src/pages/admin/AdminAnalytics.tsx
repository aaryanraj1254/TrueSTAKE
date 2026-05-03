import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { fetchAdminAnalytics } from '../../lib/api';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
const colors = ['#111827', '#2563eb', '#16a34a', '#dc2626', '#9333ea', '#ca8a04'];

export const AdminAnalytics: React.FC = () => {
  const { data } = useQuery({
    queryKey: ['admin', 'analytics'],
    queryFn: fetchAdminAnalytics,
    refetchInterval: 30_000,
  });

  const totals = data?.totals;

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Platform analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Volume, user growth, categories, and operational totals.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          ['Total volume', money(totals?.totalVolume ?? 0)],
          ['Active users', String(totals?.activeUsers ?? 0)],
          ['Open markets', String(totals?.openMarkets ?? 0)],
          ['Total users', String(totals?.totalUsers ?? 0)],
          ['Pending withdrawals', String(totals?.pendingWithdrawals ?? 0)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-2 text-xl font-bold">{value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">Daily volume</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.dailyVolume ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="volume" fill="#111827" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold">User growth</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.userGrowth ?? []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="mb-4 font-semibold">Market categories</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data?.categoryBreakdown ?? []}
                dataKey="value"
                nameKey="category"
                outerRadius={110}
                label
              >
                {(data?.categoryBreakdown ?? []).map((entry, index) => (
                  <Cell key={entry.category} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </main>
  );
};
