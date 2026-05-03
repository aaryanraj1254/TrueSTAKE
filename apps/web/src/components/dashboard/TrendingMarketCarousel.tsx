import React from 'react';
import { Link } from 'react-router-dom';
import { type TrendingMarket } from '../../lib/api';
import { LivePriceIndicator } from './LivePriceIndicator';
import { MiniChart } from './MiniChart';

interface TrendingMarketCarouselProps {
  markets: TrendingMarket[];
}

export const TrendingMarketCarousel: React.FC<TrendingMarketCarouselProps> = ({ markets }) => {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {markets.map((market) => {
        const topOption = [...(market.options ?? [])].sort(
          (a, b) => Number(b.current_price) - Number(a.current_price),
        )[0];
        const chartValues = (market.options ?? []).map((option) => option.current_price);

        return (
          <Link
            key={market.id}
            to={`/markets/${market.id}`}
            className="min-w-[280px] rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold uppercase text-primary/80">
                {market.category}
              </span>
              <span className="text-xs text-muted-foreground">
                {Number(market.volume ?? 0).toFixed(0)} staked
              </span>
            </div>
            <h3 className="line-clamp-2 min-h-12 text-base font-bold">{market.title}</h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{topOption?.label ?? 'No option'}</p>
                {market.id && topOption?.id && (
                  <LivePriceIndicator
                    marketId={market.id}
                    optionId={topOption.id}
                    initialPrice={Number(topOption.current_price)}
                  />
                )}
              </div>
              <MiniChart values={chartValues} />
            </div>
          </Link>
        );
      })}
    </div>
  );
};
