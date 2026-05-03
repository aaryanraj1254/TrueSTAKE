import React from 'react';
import { type Market } from '@truestake/shared';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface MarketCardProps {
  market: Market;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const isClosed = new Date(market.closes_at) < new Date() || market.status !== 'open';

  // Sort options by probability (price) descending
  const sortedOptions = [...(market.options || [])].sort(
    (a, b) => b.current_price - a.current_price,
  );

  return (
    <Link to={`/markets/${market.id}`} className="block">
      <div className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-primary/80 uppercase tracking-wider">
              {market.category}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}
            >
              {market.status.toUpperCase()}
            </span>
          </div>
          <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-2">{market.title}</h3>

          <div className="space-y-3 mt-4">
            {sortedOptions.slice(0, 2).map((opt) => (
              <div key={opt.id} className="flex items-center justify-between text-sm">
                <span className="text-foreground font-medium truncate pr-2">{opt.label}</span>
                <span className="text-foreground font-bold">{opt.current_price.toFixed(1)}¢</span>
              </div>
            ))}
            {sortedOptions.length > 2 && (
              <div className="text-xs text-muted-foreground text-center">
                + {sortedOptions.length - 2} more options
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
          <span>
            {market.options?.reduce((acc, opt) => acc + (opt.total_staked || 0), 0).toFixed(0)}{' '}
            staked
          </span>
          <span>Closes {format(new Date(market.closes_at), 'MMM d, yyyy')}</span>
        </div>
      </div>
    </Link>
  );
};
