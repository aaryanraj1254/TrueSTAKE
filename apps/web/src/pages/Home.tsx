import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShieldCheck, Sparkles, TrendingUp, Trophy, Wallet } from 'lucide-react';
import { fetchMarkets, fetchLeaderboard, fetchWalletMe } from '../lib/api';
import { WalletModal } from '../components/WalletModal';
import { LiveTicker } from '../components/LiveTicker';
import { NotificationBell } from '../components/NotificationBell';
import { LiveActivityFeed } from '../components/LiveActivityFeed';

const typewriterWords = ['predict outcomes', 'trade conviction', 'win on insight'];

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const stats = [
  { label: 'Active Traders', value: 12000 },
  { label: 'Markets Settled', value: 1800 },
  { label: 'Trade Volume', value: 8500000, prefix: 'Rs ' },
  { label: 'Avg Resolution', value: 18, suffix: 'h' },
];

const howItWorks = [
  {
    title: 'Pick a Market',
    description: 'Choose from live markets across crypto, sports, and world events.',
    icon: Sparkles,
  },
  {
    title: 'Take a Position',
    description: 'Buy YES or NO shares based on your conviction and current market price.',
    icon: TrendingUp,
  },
  {
    title: 'Settle & Earn',
    description: 'When outcomes resolve, winning positions are paid out automatically.',
    icon: ShieldCheck,
  },
];

const FloatingCard: React.FC<{ title: string; value: string; delay: string }> = ({
  title,
  value,
  delay,
}) => (
  <div
    className="rounded-xl border border-emerald-800/70 bg-slate-900/80 p-4 shadow-lg shadow-emerald-900/20 backdrop-blur"
    style={{ animation: `float 6s ${delay} ease-in-out infinite` }}
  >
    <p className="text-xs uppercase tracking-wider text-emerald-300">{title}</p>
    <p className="mt-2 text-xl font-bold text-emerald-100">{value}</p>
  </div>
);

export const Home = () => {
  const navigate = useNavigate();

  const { data: markets = [] } = useQuery({
    queryKey: ['home', 'markets'],
    queryFn: fetchMarkets,
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['home', 'leaderboard'],
    queryFn: fetchLeaderboard,
  });

  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [counterValues, setCounterValues] = useState(stats.map(() => 0));
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { data: walletData } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: fetchWalletMe,
  });

  const balance = Number(walletData?.wallet?.balance ?? 0);
  const trending = useMemo(() => markets.slice(0, 3), [markets]);

  const handleMarketClick = (symbol: string) => {
    // Navigate to market page based on symbol
    if (symbol === 'BTC' || symbol === 'ETH' || symbol === 'SOL') {
      navigate(`/markets/crypto/${symbol.toLowerCase()}`);
    } else {
      navigate('/markets');
    }
  };

  useEffect(() => {
    const currentWord = typewriterWords[wordIndex];
    const timeout = setTimeout(
      () => {
        if (!deleting && charIndex < currentWord.length) {
          setCharIndex((value) => value + 1);
          return;
        }

        if (!deleting && charIndex === currentWord.length) {
          setDeleting(true);
          return;
        }

        if (deleting && charIndex > 0) {
          setCharIndex((value) => value - 1);
          return;
        }

        setDeleting(false);
        setWordIndex((value) => (value + 1) % typewriterWords.length);
      },
      deleting ? 35 : 70,
    );

    return () => clearTimeout(timeout);
  }, [wordIndex, charIndex, deleting]);

  useEffect(() => {
    const durationMs = 1200;
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const progress = Math.min(elapsed / durationMs, 1);
      setCounterValues(stats.map((item) => Math.floor(item.value * progress)));

      if (progress >= 1) {
        window.clearInterval(timer);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <style>{`@keyframes float { 0%,100% { transform: translateY(0px);} 50% { transform: translateY(-12px);} }`}</style>

      <header className="border-b border-emerald-900/60 bg-slate-950/90 backdrop-blur">
        <nav className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-lg font-extrabold tracking-tight"
          >
            <BarChart3 className="h-5 w-5 text-emerald-400" />
            <span>TrueStake</span>
            {/* LIVE Badge for Active Sports */}
            <span className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white animate-pulse">
              LIVE
            </span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Wallet Chip */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="flex items-center gap-2 rounded-full border border-emerald-700/50 bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 px-4 py-2 text-sm font-semibold text-emerald-100 hover:border-emerald-500/70 hover:bg-emerald-500/20 transition-all duration-200"
            >
              <Wallet className="h-4 w-4" />
              <span>🪙 {currency.format(balance)}</span>
            </button>
            <Link
              to="/login"
              className="rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-300"
            >
              SignUp
            </Link>
          </div>
        </nav>
      </header>

      {/* Live Data Ticker */}
      <LiveTicker onMarketClick={handleMarketClick} />

      <main>
        {/* Hero Section */}
        <section className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-700/70 bg-emerald-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Opinion Trading Platform
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-emerald-100 md:text-5xl">
              Trade the future with conviction.
            </h1>
            <p className="mt-4 text-lg text-emerald-200/80">
              {typewriterWords.slice(0, wordIndex + 1).join('')}
              <span className="animate-pulse">|</span>
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="rounded-lg bg-emerald-400 px-6 py-3 text-center font-bold text-slate-950 hover:bg-emerald-300 transition-colors"
              >
                Start Trading
              </Link>
              <Link
                to="/markets"
                className="rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-6 py-3 text-center font-semibold text-emerald-200 hover:bg-emerald-900/50 transition-colors"
              >
                Browse Markets
              </Link>
              <button
                onClick={() => {
                  // Enable demo mode with ₹5000 fake money
                  alert(
                    'Demo Mode activated! You now have ₹5,000 in fake money to try all features.',
                  );
                }}
                className="rounded-lg border border-amber-500/50 bg-amber-500/20 px-6 py-3 text-center font-semibold text-amber-100 hover:bg-amber-500/30 transition-colors"
              >
                Try Demo →
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingCard title="BTC above $80K?" value="YES 62.3c" delay="0s" />
            <FloatingCard title="Election turnout > 68%" value="NO 44.1c" delay="0.8s" />
            <FloatingCard title="IPL Final upset?" value="YES 53.4c" delay="1.2s" />
            <FloatingCard title="Nifty closes green" value="NO 47.9c" delay="0.4s" />
          </div>
        </section>

        {/* Feature Buttons */}
        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Live Markets */}
            <Link
              to="/markets"
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  📈
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">Live Markets</h3>
                <p className="text-sm text-emerald-200/80">Bet on live IPL matches</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* Sports Betting */}
            <Link
              to="/markets/sports"
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  🏏
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">Sports Betting</h3>
                <p className="text-sm text-emerald-200/80">Cricket, Football & more</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* Celeb Tweets */}
            <Link
              to="/markets/tweets"
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  🐦
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">Celeb Tweets</h3>
                <p className="text-sm text-emerald-200/80">Trade celeb tweet impressions</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* Crypto & Forex */}
            <Link
              to="/markets/crypto"
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  ₿
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">Crypto & Forex</h3>
                <p className="text-sm text-emerald-200/80">BTC, ETH & currency pairs</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* Leaderboard */}
            <Link
              to="/dashboard/leaderboard"
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  🏆
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">Leaderboard</h3>
                <p className="text-sm text-emerald-200/80">Top traders rankings</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </Link>

            {/* My Wallet */}
            <button
              onClick={() => setIsWalletModalOpen(true)}
              className="group relative overflow-hidden rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-8 backdrop-blur-xl transition-all duration-300 hover:scale-105 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            >
              <div className="relative z-10">
                <div className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  👛
                </div>
                <h3 className="mb-2 text-xl font-bold text-emerald-100">My Wallet</h3>
                <p className="text-sm text-emerald-200/80">Manage funds & transactions</p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </button>
          </div>
        </section>

        <section className="border-y border-emerald-900/60 bg-slate-900/60">
          <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 md:grid-cols-4">
            {stats.map((item, index) => (
              <div
                key={item.label}
                className="rounded-lg border border-emerald-900/70 bg-slate-950/70 p-4 text-center"
              >
                <p className="text-2xl font-extrabold text-emerald-300">
                  {item.prefix || ''}
                  {counterValues[index].toLocaleString('en-IN')}
                  {item.suffix || ''}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wider text-emerald-200/70">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* LiveActivity + Trending Markets Side by Side */}
        <section className="container mx-auto grid gap-8 px-4 py-16 lg:grid-cols-2">
          {/* Live Activity Feed */}
          <LiveActivityFeed />

          {/* Trending Markets */}
          <div className="rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-xl shadow-2xl p-6">
            <h3 className="text-lg font-bold text-emerald-100 mb-4">Trending Markets</h3>
            <div className="space-y-3">
              {trending.map((market) => (
                <Link
                  key={market.id}
                  to={`/markets/${market.id}`}
                  className="block p-4 rounded-lg border border-emerald-800/20 bg-slate-900/50 hover:bg-emerald-900/30 hover:border-emerald-600/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-emerald-100">{market.title}</h4>
                      <p className="text-sm text-emerald-200/60">{market.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-emerald-100">
                        YES: {market.yes_price}c
                      </div>
                      <div className="text-sm text-emerald-200/60">NO: {market.no_price}c</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-emerald-100">How it works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {howItWorks.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="rounded-xl border border-emerald-900/70 bg-slate-900 p-5"
                >
                  <Icon className="h-6 w-6 text-emerald-400" />
                  <h3 className="mt-3 text-lg font-semibold text-emerald-100">{step.title}</h3>
                  <p className="mt-2 text-sm text-emerald-200/75">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="container mx-auto px-4 pb-16">
          <h2 className="text-2xl font-bold text-emerald-100">Leaderboard Preview</h2>
          <p className="mt-2 text-sm text-emerald-200/70">Top traders this week.</p>
          <div className="mt-6 rounded-xl border border-emerald-900/60 bg-slate-900 p-6">
            <div className="space-y-4">
              {leaderboard.slice(0, 5).map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : index === 1
                            ? 'bg-gray-500/20 text-gray-400'
                            : index === 2
                              ? 'bg-orange-500/20 text-orange-400'
                              : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-emerald-100">{user.displayName}</p>
                      <p className="text-xs text-emerald-200/60">
                        Total Payout: ₹{user.totalPayout.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-emerald-200/60">Profit</p>
                    <p
                      className={`font-semibold ${
                        user.profit > 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      ₹{user.profit.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
              {leaderboard.length === 0 &&
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 animate-pulse rounded-full bg-emerald-900/70" />
                      <div>
                        <div className="h-4 w-24 animate-pulse rounded bg-emerald-900/60" />
                        <div className="mt-1 h-3 w-16 animate-pulse rounded bg-emerald-900/50" />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="h-3 w-12 animate-pulse rounded bg-emerald-900/60" />
                      <div className="mt-1 h-4 w-16 animate-pulse rounded bg-emerald-900/50" />
                    </div>
                  </div>
                ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                to="/dashboard/leaderboard"
                className="inline-flex items-center gap-2 rounded-lg border border-emerald-700 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-900/40"
              >
                <Trophy className="h-4 w-4" />
                View Full Leaderboard
              </Link>
            </div>
          </div>
        </section>

        {/* Marquee Stats Bar */}
        <section className="border-y border-emerald-800/30 bg-gradient-to-r from-emerald-500/10 via-emerald-600/20 to-emerald-500/10 py-3 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <span className="inline-block px-4 text-sm font-semibold text-emerald-100">
              🏆 52,000 traders | ₹4.2Cr volume | 1,240 markets resolved | 94% payout rate
            </span>
            <span className="inline-block px-4 text-sm font-semibold text-emerald-100">
              🏆 52,000 traders | ₹4.2Cr volume | 1,240 markets resolved | 94% payout rate
            </span>
            <span className="inline-block px-4 text-sm font-semibold text-emerald-100">
              🏆 52,000 traders | ₹4.2Cr volume | 1,240 markets resolved | 94% payout rate
            </span>
          </div>
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
            .animate-marquee {
              animation: marquee 20s linear infinite;
            }
          `}</style>
        </section>
      </main>

      <footer className="border-t border-emerald-900/60 bg-slate-950">
        <div className="container mx-auto flex flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-emerald-200/70 md:flex-row">
          <p>© {new Date().getFullYear()} TrueStake. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/markets" className="hover:text-emerald-300">
              Markets
            </Link>
            <Link to="/login" className="hover:text-emerald-300">
              Login
            </Link>
            <Link to="/register" className="hover:text-emerald-300">
              SignUp
            </Link>
          </div>
        </div>
        <div className="container mx-auto px-4 pb-4 text-center">
          <p className="text-xs text-emerald-200/50 max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> TrueStake is a prediction market platform for educational
            and entertainment purposes only. Trading involves financial risk and may not be suitable
            for all investors. Please trade responsibly and never risk more than you can afford to
            lose. All markets are for prediction purposes and do not constitute financial advice.
          </p>
        </div>
      </footer>

      {/* Wallet Modal */}
      <WalletModal isOpen={isWalletModalOpen} onClose={() => setIsWalletModalOpen(false)} />
    </div>
  );
};
