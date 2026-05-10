import React from 'react';
import { type Market } from '@truestake/shared';
import { Link } from 'react-router-dom';
import { formatDistanceToNowStrict } from 'date-fns';

interface MarketCardProps {
  market: Market;
}

export const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const [countdown, setCountdown] = React.useState(() =>
    formatDistanceToNowStrict(new Date(market.closes_at), { addSuffix: true }),
  );
  const isClosed = new Date(market.closes_at) < new Date() || market.status !== 'open';
  const totalVolume = (market.options || []).reduce((acc, opt) => acc + (opt.total_staked || 0), 0);

  const sortedOptions = [...(market.options || [])].sort(
    (a, b) => b.current_price - a.current_price,
  );
  const yesOption =
    sortedOptions.find((option) => option.label.toLowerCase() === 'yes') || sortedOptions[0];
  const noOption =
    sortedOptions.find((option) => option.label.toLowerCase() === 'no') ||
    sortedOptions.find((option) => option.id !== yesOption?.id);

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(formatDistanceToNowStrict(new Date(market.closes_at), { addSuffix: true }));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [market.closes_at]);

  return (
    <Link to={`/markets/${market.id}`} className="block">
      <div className="flex h-full flex-col justify-between rounded-xl border border-emerald-900/50 bg-slate-900 p-5 shadow-lg shadow-transparent transition-all duration-200 hover:-translate-y-0.5 hover:shadow-emerald-900/30">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="rounded-full border border-emerald-700/70 bg-emerald-900/30 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              {market.category}
            </span>
            <span
              className={`rounded-full px-2 py-1 text-xs ${isClosed ? 'bg-slate-800 text-slate-300' : 'bg-emerald-500/20 text-emerald-300'}`}
            >
              {market.status.toUpperCase()}
            </span>
          </div>
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-slate-100">{market.title}</h3>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="rounded-lg border border-emerald-700/80 bg-emerald-500/10 px-3 py-2 text-left transition-colors hover:bg-emerald-500/20"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                YES
              </p>
              <p className="text-base font-bold text-emerald-100">
                {yesOption ? `${yesOption.current_price.toFixed(1)}¢` : '--'}
              </p>
            </button>
            <button
              type="button"
              className="rounded-lg border border-slate-700 bg-slate-800/70 px-3 py-2 text-left transition-colors hover:bg-slate-700"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-300">
                NO
              </p>
              <p className="text-base font-bold text-slate-100">
                {noOption ? `${noOption.current_price.toFixed(1)}¢` : '--'}
              </p>
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4 text-xs text-slate-300">
          <span>Vol {totalVolume.toFixed(0)}</span>
          <span>{countdown}</span>
        </div>
      </div>
    </Link>
  );
};
