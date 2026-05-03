import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminMarkets, resolveAdminMarket } from '../../lib/api';

export const ResolveMarketAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: markets = [] } = useQuery({
    queryKey: ['admin', 'markets'],
    queryFn: fetchAdminMarkets,
  });
  const unresolved = markets.filter((market) => market.status !== 'resolved');
  const [marketId, setMarketId] = useState('');
  const [optionId, setOptionId] = useState('');

  const selectedMarket = unresolved.find((market) => market.id === marketId);

  const resolveMutation = useMutation({
    mutationFn: resolveAdminMarket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setOptionId('');
    },
  });

  return (
    <main className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Resolve market</h1>
        <p className="mt-1 text-muted-foreground">Select the winning option and trigger payouts.</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <label className="block text-sm font-medium">
          Market
          <select
            value={marketId}
            onChange={(event) => {
              setMarketId(event.target.value);
              setOptionId('');
            }}
            className="mt-2 w-full rounded-lg border border-input px-3 py-2"
          >
            <option value="">Select market</option>
            {unresolved.map((market) => (
              <option key={market.id} value={market.id}>
                {market.title}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-5 block text-sm font-medium">
          Winning option
          <select
            value={optionId}
            onChange={(event) => setOptionId(event.target.value)}
            className="mt-2 w-full rounded-lg border border-input px-3 py-2"
            disabled={!selectedMarket}
          >
            <option value="">Select option</option>
            {(selectedMarket?.options ?? []).map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          disabled={!marketId || !optionId || resolveMutation.isPending}
          onClick={() => resolveMutation.mutate({ marketId, correct_outcome: optionId })}
          className="mt-6 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground disabled:opacity-60"
        >
          Resolve and pay winners
        </button>
      </div>
    </main>
  );
};
