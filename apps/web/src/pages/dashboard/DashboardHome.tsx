import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Wallet, BarChart3, Trophy, ArrowUpRight, ArrowDownRight, Eye, Clock } from 'lucide-react';
import { fetchPortfolio, fetchProfileStats, fetchWalletMe } from '../../lib/api';
import { Skeleton, TableSkeleton } from '../../components/Skeleton';
import { useAuth } from '../../hooks/useAuth';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatAmount = (amount: number | string) => currency.format(Number(amount));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const transactionTypeTone: Record<string, string> = {
  deposit: 'bg-emerald-500/15 text-emerald-700',
  withdrawal: 'bg-orange-500/15 text-orange-700',
  bet: 'bg-blue-500/15 text-blue-700',
  payout: 'bg-purple-500/15 text-purple-700',
};

const statusTone: Record<string, string> = {
  pending: 'bg-amber-500/15 text-amber-700',
  won: 'bg-green-500/15 text-green-700',
  lost: 'bg-red-500/15 text-red-700',
};

export const DashboardHome: React.FC = () => {
  const { user } = useAuth();

  const { data: portfolio, isLoading: portfolioLoading } = useQuery({
    queryKey: ['dashboard', 'portfolio'],
    queryFn: fetchPortfolio,
  });

  const { data: profileStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard', 'profile'],
    queryFn: fetchProfileStats,
  });

  const { data: walletData, isLoading: walletLoading } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: fetchWalletMe,
  });

  const balance = Number(walletData?.wallet?.balance ?? 0);
  const trades = portfolio?.trades ?? [];
  const transactions = walletData?.transactions ?? [];
  const stats = profileStats;

  const activeTrades = trades.filter((trade) => trade.outcome === 'pending');
  const recentTransactions = transactions.slice(0, 5);

  const isLoading = portfolioLoading || statsLoading || walletLoading;

  if (isLoading) {
    return (
      <main className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24" />
          ))}
        </div>
        <TableSkeleton rows={5} columns={4} />
        <TableSkeleton rows={5} columns={3} />
      </main>
    );
  }

  return (
    <main className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.username || 'Trader'}!
          </h1>
          <p className="mt-1 text-muted-foreground">
            Here's your trading overview and recent activity.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/markets"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4" />
            Markets
          </Link>
          <Link
            to="/wallet"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
          >
            <Wallet className="h-4 w-4" />
            Wallet
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Balance</p>
              <p className="mt-2 text-2xl font-bold">{formatAmount(balance)}</p>
            </div>
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Trades</p>
              <p className="mt-2 text-2xl font-bold">{stats?.tradesPlaced || 0}</p>
            </div>
            <div className="rounded-lg bg-blue-500/10 p-3 text-blue-500">
              <BarChart3 className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Win Rate</p>
              <p className="mt-2 text-2xl font-bold">
                {stats?.winRate ? `${(stats.winRate * 100).toFixed(1)}%` : '0%'}
              </p>
            </div>
            <div className="rounded-lg bg-green-500/10 p-3 text-green-500">
              <Trophy className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Profit</p>
              <p
                className={`mt-2 text-2xl font-bold ${
                  (stats?.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatAmount(stats?.profit || 0)}
              </p>
            </div>
            <div
              className={`rounded-lg p-3 ${
                (stats?.profit || 0) >= 0
                  ? 'bg-green-500/10 text-green-500'
                  : 'bg-red-500/10 text-red-500'
              }`}
            >
              {(stats?.profit || 0) >= 0 ? (
                <ArrowUpRight className="h-6 w-6" />
              ) : (
                <ArrowDownRight className="h-6 w-6" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Active Trades Table */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" />
            My Active Trades
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Market</th>
                <th className="px-6 py-3 font-semibold">Option</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Payout</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {activeTrades.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-muted-foreground" colSpan={5}>
                    No active trades.
                  </td>
                </tr>
              ) : (
                activeTrades.map((trade) => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium">{trade.market?.title || 'Unknown Market'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium">{trade.option?.label || '-'}</span>
                    </td>
                    <td className="px-6 py-4">{formatAmount(trade.amount)}</td>
                    <td className="px-6 py-4">{trade.payout ? formatAmount(trade.payout) : '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[trade.outcome]}`}
                      >
                        {trade.outcome}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            My Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-semibold">Type</th>
                <th className="px-6 py-3 font-semibold">Amount</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentTransactions.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-center text-muted-foreground" colSpan={4}>
                    No recent transactions.
                  </td>
                </tr>
              ) : (
                recentTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transactionTypeTone[transaction.type]}`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">{formatAmount(transaction.amount)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[transaction.status]}`}
                      >
                        {transaction.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {formatDate(transaction.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};
