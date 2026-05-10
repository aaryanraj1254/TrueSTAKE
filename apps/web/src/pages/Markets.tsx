import React from 'react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { fetchMarkets } from '../lib/api';
import { MarketCard } from '../components/markets/MarketCard';
import { SkeletonCard } from '../components/ui/Skeleton';

export const Markets: React.FC = () => {
  const { user } = useAuth();
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['markets'],
    queryFn: fetchMarkets,
  });

  const categories = useMemo(() => {
    const set = new Set(markets.map((market) => market.category).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [markets]);

  const filteredMarkets = useMemo(() => {
    return markets.filter((market) => {
      const categoryMatch = categoryFilter === 'all' || market.category === categoryFilter;
      const statusMatch = statusFilter === 'all' || market.status === statusFilter;
      return categoryMatch && statusMatch;
    });
  }, [markets, categoryFilter, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-emerald-100">Markets</h1>
            <p className="mt-2 text-emerald-200/80">
              Predict outcomes on politics, sports, crypto, and more.
            </p>
          </div>
          {user && (
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/wallet"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Link>
            </div>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-emerald-800 bg-slate-900 px-3 py-2 text-sm text-emerald-100"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-emerald-800 bg-slate-900 px-3 py-2 text-sm text-emerald-100"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : filteredMarkets.length === 0 ? (
          <div className="rounded-lg border border-dashed border-emerald-900 bg-slate-900/70 py-12 text-center text-emerald-200/80">
            No markets found for the selected filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredMarkets.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
