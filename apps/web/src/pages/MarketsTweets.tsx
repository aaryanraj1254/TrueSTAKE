import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter } from 'lucide-react';
import { TweetBetCard } from '../components/TweetBetCard';
import { fetchCelebrityTweets } from '../lib/api';

export const MarketsTweets: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: tweets = [], isLoading } = useQuery({
    queryKey: ['celebrity-tweets', selectedFilter, searchTerm],
    queryFn: () => fetchCelebrityTweets(selectedFilter, searchTerm),
  });

  const filters = [
    { value: 'all', label: 'All Tweets' },
    { value: 'bollywood', label: 'Bollywood' },
    { value: 'politics', label: 'Politics' },
    { value: 'cricket', label: 'Cricket' },
    { value: 'tech', label: 'Tech' },
  ];

  const getFilteredTweets = () => {
    let filtered = tweets;

    if (selectedFilter !== 'all') {
      filtered = filtered.filter((tweet) =>
        tweet.celeb_name.toLowerCase().includes(selectedFilter.toLowerCase()),
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (tweet) =>
          tweet.tweet_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tweet.celeb_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          tweet.handle.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    return filtered;
  };

  const recentTweets = getFilteredTweets().slice(0, 8);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="border-b border-emerald-800/30 bg-slate-900/60 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-emerald-100">Celebrity Tweet Betting</h1>
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Filter className="absolute left-3 h-4 w-4 text-emerald-200/60" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tweets, celebrities..."
                  className="w-64 rounded-lg border border-emerald-800/30 bg-slate-900/50 pl-10 pr-4 py-2 text-emerald-100 placeholder-emerald-200/50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Filter Dropdown */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="rounded-lg border border-emerald-800/30 bg-slate-900/50 px-4 py-2 text-emerald-100 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              >
                {filters.map((filter) => (
                  <option key={filter.value} value={filter.value}>
                    {filter.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Recent Tweets Grid */}
          <div>
            <h2 className="text-xl font-bold text-emerald-100 mb-6">Live Tweets</h2>

            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-64 rounded-xl border border-emerald-800/30 bg-slate-900/50 animate-pulse"
                  />
                ))}
              </div>
            ) : recentTweets.length === 0 ? (
              <div className="rounded-xl border border-dashed border-emerald-800/30 p-12 text-center">
                <p className="text-emerald-200/60">No tweets found matching your criteria.</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {recentTweets.map((tweet) => (
                  <TweetBetCard key={tweet.id} tweet={tweet} />
                ))}
              </div>
            )}
          </div>

          {/* Just Tweeted Section */}
          <div>
            <h2 className="text-xl font-bold text-emerald-100 mb-6">Just Tweeted! 🔥</h2>

            <div className="rounded-xl border border-emerald-800/30 bg-slate-900/50 p-6">
              <div className="space-y-4">
                {getFilteredTweets()
                  .filter((tweet) => new Date(tweet.posted_at) > twoHoursAgo)
                  .slice(0, 3)
                  .map((tweet) => (
                    <div
                      key={tweet.id}
                      className="flex items-start gap-4 p-4 rounded-lg border border-emerald-800/20 bg-slate-800/50"
                    >
                      {/* NEW Badge */}
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white animate-pulse">
                          NEW
                        </span>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {tweet.celeb_name.split(' ')[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-emerald-100">{tweet.celeb_name}</div>
                            <div className="text-sm text-emerald-200/60">@{tweet.handle}</div>
                            <div className="text-xs text-emerald-200/60">
                              {new Date(tweet.posted_at).toLocaleDateString('en-IN', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>

                        <p className="text-emerald-100 leading-relaxed mb-3">
                          "{tweet.tweet_text}"
                        </p>

                        <div className="flex items-center gap-4 text-sm text-emerald-200/60">
                          <span>
                            👁 {tweet.impressions.toLocaleString()} | 🔁{' '}
                            {tweet.retweets.toLocaleString()} | ❤️ {tweet.likes.toLocaleString()}
                          </span>
                          <a
                            href={tweet.tweet_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            View Tweet →
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
