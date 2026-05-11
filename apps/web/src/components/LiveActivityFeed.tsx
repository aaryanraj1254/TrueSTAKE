import React, { useState, useEffect } from 'react';
import { browserSupabase } from '../lib/supabase';
import { TrendingUp, CheckCircle, Twitter, Bell } from 'lucide-react';

interface Activity {
  id: string;
  type: 'trade' | 'resolution' | 'tweet' | 'market';
  message: string;
  timestamp: string;
  icon: React.ReactNode;
  color: string;
}

export const LiveActivityFeed: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      type: 'trade',
      message: '🟢 Rahul_*** bet ₹500 on YES — Will BTC cross ₹70L?',
      timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'text-emerald-400',
    },
    {
      id: '2',
      type: 'resolution',
      message: '✅ Market resolved: MI scored 180+',
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      icon: <CheckCircle className="h-4 w-4" />,
      color: 'text-emerald-400',
    },
    {
      id: '3',
      type: 'tweet',
      message: '🐦 New tweet market: @virat.kohli just tweeted',
      timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
      icon: <Twitter className="h-4 w-4" />,
      color: 'text-blue-400',
    },
  ]);

  useEffect(() => {
    if (!browserSupabase) return;

    // Subscribe to trades table changes
    const tradesSubscription = browserSupabase
      .channel('trades_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'trades',
        },
        (payload) => {
          const newActivity: Activity = {
            id: payload.new.id,
            type: 'trade',
            message: `🟢 ${payload.new.user_id?.substring(0, 8)}*** bet ₹${payload.new.amount} on ${payload.new.option_id} — Market #${payload.new.market_id}`,
            timestamp: payload.new.created_at,
            icon: <TrendingUp className="h-4 w-4" />,
            color: 'text-emerald-400',
          };

          setActivities((prev) => [newActivity, ...prev].slice(0, 10));
        },
      )
      .subscribe();

    // Subscribe to markets table changes (resolutions)
    const marketsSubscription = browserSupabase
      .channel('markets_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'markets',
        },
        (payload) => {
          if (payload.new.status !== payload.old.status && payload.new.status !== 'open') {
            const newActivity: Activity = {
              id: `market-${payload.new.id}`,
              type: 'resolution',
              message: `✅ Market resolved: ${payload.new.title} — ${payload.new.status}`,
              timestamp: payload.new.updated_at,
              icon: <CheckCircle className="h-4 w-4" />,
              color: 'text-emerald-400',
            };

            setActivities((prev) => [newActivity, ...prev].slice(0, 10));
          }
        },
      )
      .subscribe();

    // Simulate tweet market notifications
    const tweetInterval = setInterval(() => {
      const randomCelebs = [
        '@narendramodi',
        '@virat.kohli',
        '@elonmusk',
        '@akshaykumar',
        '@sachin_rt',
      ];
      const randomCeleb = randomCelebs[Math.floor(Math.random() * randomCelebs.length)];

      const newActivity: Activity = {
        id: `tweet-${Date.now()}`,
        type: 'tweet',
        message: `🐦 New tweet market: ${randomCeleb} just tweeted`,
        timestamp: new Date().toISOString(),
        icon: <Twitter className="h-4 w-4" />,
        color: 'text-blue-400',
      };

      setActivities((prev) => [newActivity, ...prev].slice(0, 10));
    }, 30000); // Every 30 seconds

    return () => {
      browserSupabase.removeChannel(tradesSubscription);
      browserSupabase.removeChannel(marketsSubscription);
      clearInterval(tweetInterval);
    };
  }, []);

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const past = new Date(timestamp);
    const diff = now.getTime() - past.getTime();

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-emerald-100">Live Activity</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-xs text-emerald-200/60">Live</span>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 text-emerald-200/30 mx-auto mb-2" />
            <p className="text-emerald-200/60">No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-emerald-800/20 bg-slate-900/50 transition-all duration-300 hover:border-emerald-700/40 hover:bg-slate-900/70"
              style={{
                animation: index === 0 ? 'slideIn 0.3s ease-out' : undefined,
              }}
            >
              <div className={`flex-shrink-0 ${activity.color}`}>{activity.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-emerald-100 leading-relaxed">{activity.message}</p>
                <p className="text-xs text-emerald-200/60 mt-1">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
