import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity } from 'lucide-react';
import { fetchMarket } from '../../lib/api';

interface LivePriceIndicatorProps {
  marketId: string;
  optionId: string;
  initialPrice: number;
}

export const LivePriceIndicator: React.FC<LivePriceIndicatorProps> = ({
  marketId,
  optionId,
  initialPrice,
}) => {
  const { data, isFetching } = useQuery({
    queryKey: ['market-live-price', marketId],
    queryFn: () => fetchMarket(marketId),
    refetchInterval: 10_000,
  });

  const option = data?.options?.find((item) => item.id === optionId);
  const price = Number(option?.current_price ?? initialPrice);

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold">
      <Activity
        className={`h-3.5 w-3.5 ${isFetching ? 'animate-pulse text-green-600' : 'text-muted-foreground'}`}
      />
      {price.toFixed(1)}c
    </span>
  );
};
