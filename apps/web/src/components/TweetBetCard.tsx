import React, { useState, useEffect } from 'react';
import { Clock, ExternalLink } from 'lucide-react';

interface Tweet {
  id: string;
  celeb_name: string;
  handle: string;
  tweet_text: string;
  tweet_url: string;
  posted_at: string;
  impressions: number;
  retweets: number;
  likes: number;
  market_status: 'open' | 'resolved_yes' | 'resolved_no';
  created_at: string;
  updated_at: string;
}

interface TweetBetCardProps {
  tweet: Tweet;
  onBetPlaced?: () => void;
}

export const TweetBetCard: React.FC<TweetBetCardProps> = ({ tweet, onBetPlaced }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const posted = new Date(tweet.posted_at);
      const diff = now.getTime() - posted.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours >= 24) {
        setTimeLeft('Expired');
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [tweet.posted_at]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleBet = (option: 'YES' | 'NO', target: string) => {
    setIsPlacingBet(true);

    // Simulate bet placement
    setTimeout(() => {
      setIsPlacingBet(false);
      onBetPlaced?.();

      // Show success message
      const message = `Bet placed on ${option} for "${target}"`;
      if (typeof window !== 'undefined') {
        window.alert(message);
      }
    }, 1000);
  };

  const isExpired = timeLeft === 'Expired';
  const isResolved = tweet.market_status !== 'open';

  return (
    <div className="rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Twitter Header */}
      <div className="flex items-center gap-3 border-b border-emerald-800/20 bg-slate-900/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">𝕏</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-emerald-100">{tweet.celeb_name}</span>
              <span className="text-emerald-200/60">@{tweet.handle}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-emerald-200/60">
          <Clock className="h-4 w-4" />
          <span>
            {new Date(tweet.posted_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <a
          href={tweet.tweet_url}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>

      {/* Tweet Content */}
      <div className="p-6">
        <p className="text-emerald-100 leading-relaxed mb-4">"{tweet.tweet_text}"</p>

        {/* Live Stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 rounded-lg border border-emerald-800/20 bg-slate-900/50 p-3 text-center">
            <div className="text-2xl mb-1">👁</div>
            <div className="text-sm text-emerald-200/60">Impressions</div>
            <div className="text-lg font-bold text-emerald-100">
              {formatNumber(tweet.impressions)}
            </div>
          </div>
          <div className="flex-1 rounded-lg border border-emerald-800/20 bg-slate-900/50 p-3 text-center">
            <div className="text-2xl mb-1">🔁</div>
            <div className="text-sm text-emerald-200/60">Retweets</div>
            <div className="text-lg font-bold text-emerald-100">{formatNumber(tweet.retweets)}</div>
          </div>
          <div className="flex-1 rounded-lg border border-emerald-800/20 bg-slate-900/50 p-3 text-center">
            <div className="text-2xl mb-1">❤️</div>
            <div className="text-sm text-emerald-200/60">Likes</div>
            <div className="text-lg font-bold text-emerald-100">{formatNumber(tweet.likes)}</div>
          </div>
        </div>

        {/* Countdown Timer */}
        {!isExpired && !isResolved && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-center">
            <div className="text-sm font-medium text-amber-100">Time Remaining</div>
            <div className="text-lg font-bold text-amber-100">{timeLeft}</div>
          </div>
        )}

        {/* Status Badge */}
        {isResolved && (
          <div
            className={`rounded-lg border p-3 text-center ${
              tweet.market_status === 'resolved_yes'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-red-500/30 bg-red-500/10 text-red-100'
            }`}
          >
            <div className="text-sm font-medium">
              {tweet.market_status === 'resolved_yes' ? '✅ Resolved YES' : '❌ Resolved NO'}
            </div>
          </div>
        )}

        {isExpired && (
          <div className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-3 text-center">
            <div className="text-sm font-medium text-slate-400">❌ Market Expired</div>
          </div>
        )}
      </div>

      {/* Betting Options */}
      {!isExpired && !isResolved && (
        <div className="border-t border-emerald-800/20 bg-slate-900/50 p-4">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-emerald-100 mb-2">Place Your Bet</h3>

            {/* Cross 50K Impressions */}
            <div className="rounded-lg border border-emerald-800/30 bg-slate-900/50 p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100">Cross 50K impressions?</span>
                <span className="text-sm text-emerald-200/60">
                  Current: {formatNumber(tweet.impressions)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleBet('NO', '50K impressions')}
                  disabled={isPlacingBet}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/70 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  NO
                </button>
                <button
                  onClick={() => handleBet('YES', '50K impressions')}
                  disabled={isPlacingBet}
                  className="rounded-lg border border-emerald-700/50 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  YES
                </button>
              </div>
            </div>

            {/* Cross 1000 RTs */}
            <div className="rounded-lg border border-emerald-800/30 bg-slate-900/50 p-4 mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100">Cross 1000 RTs?</span>
                <span className="text-sm text-emerald-200/60">
                  Current: {formatNumber(tweet.retweets)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleBet('NO', '1000 RTs')}
                  disabled={isPlacingBet}
                  className="rounded-lg border border-slate-700/50 bg-slate-800/70 px-4 py-3 text-sm font-medium text-slate-200 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  NO
                </button>
                <button
                  onClick={() => handleBet('YES', '1000 RTs')}
                  disabled={isPlacingBet}
                  className="rounded-lg border border-emerald-700/50 bg-emerald-500/20 px-4 py-3 text-sm font-medium text-emerald-100 hover:bg-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  YES
                </button>
              </div>
            </div>
          </div>

          {isPlacingBet && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-transparent"></div>
                <span className="text-sm font-medium text-slate-950">Placing bet...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
