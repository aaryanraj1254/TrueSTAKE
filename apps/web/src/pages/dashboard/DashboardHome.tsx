import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { fetchTrendingMarkets } from '../../lib/api';
import { TrendingMarketCarousel } from '../../components/dashboard/TrendingMarketCarousel';
import { Skeleton } from '../../components/Skeleton';

export const DashboardHome: React.FC = () => {
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['dashboard', 'trending'],
    queryFn: fetchTrendingMarkets,
    refetchInterval: 10_000,
  });

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Home feed</h1>
          <p className="mt-1 text-muted-foreground">
            Trending markets with live prices and quick movement snapshots.
          </p>
        </div>
        <Link
          to="/markets"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
        >
          <TrendingUp className="h-4 w-4" />
          Explore all
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          <Skeleton className="h-44 min-w-[280px]" />
          <Skeleton className="h-44 min-w-[280px]" />
          <Skeleton className="h-44 min-w-[280px]" />
        </div>
      ) : markets.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-muted-foreground">
          No trending markets yet.
        </div>
      ) : (
        <TrendingMarketCarousel markets={markets} />
      )}
    </main>
  );
};
