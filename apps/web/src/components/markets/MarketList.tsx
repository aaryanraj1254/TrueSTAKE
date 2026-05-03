import React, { useState, useEffect } from 'react';
import { type Market } from '@truestake/shared';
import axios from 'axios';
import { MarketCard } from './MarketCard';

export const MarketList: React.FC = () => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');
  const [status, setStatus] = useState<string>('open');

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (status) params.append('status', status);

        const res = await axios.get(`${import.meta.env.VITE_API_URL}/markets?${params.toString()}`);
        setMarkets(res.data);
      } catch (err) {
        console.error('Failed to fetch markets', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMarkets();
  }, [category, status]);

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h2 className="text-2xl font-bold text-foreground">Explore Markets</h2>
        <div className="flex gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Categories</option>
            <option value="Politics">Politics</option>
            <option value="Crypto">Crypto</option>
            <option value="Sports">Sports</option>
            <option value="Pop Culture">Pop Culture</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : markets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
          No markets found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {markets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      )}
    </div>
  );
};
