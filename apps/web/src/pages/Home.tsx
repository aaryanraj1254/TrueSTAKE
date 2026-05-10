import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, ShieldCheck, Sparkles, TrendingUp, Trophy } from 'lucide-react';
import { fetchMarkets, fetchLeaderboard } from '../lib/api';

const typewriterWords = ['predict outcomes', 'trade conviction', 'win on insight'];

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

  const trending = useMemo(() => markets.slice(0, 3), [markets]);

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
          </Link>
          <div className="flex items-center gap-3">
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

      <main>
        <section className="container mx-auto grid gap-12 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-emerald-700/70 bg-emerald-900/30 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-300">
              Opinion Trading Platform
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-emerald-100 md:text-5xl">
              Trade the future with conviction.
            </h1>
            <p className="mt-4 text-lg text-emerald-200/80">
              Join India&apos;s prediction market to{' '}
              <span className="font-semibold text-emerald-400">
                {typewriterWords[wordIndex].slice(0, charIndex)}
                <span className="animate-pulse">|</span>
              </span>
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/markets"
                className="rounded-lg bg-emerald-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-300"
              >
                Explore Markets
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-emerald-700 px-5 py-2.5 text-sm font-bold text-emerald-200 hover:bg-emerald-900/40"
              >
                Start Trading
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FloatingCard title="BTC above $80K?" value="YES 62.3c" delay="0s" />
            <FloatingCard title="Election turnout > 68%" value="NO 44.1c" delay="0.8s" />
            <FloatingCard title="IPL Final upset?" value="YES 53.4c" delay="1.2s" />
            <FloatingCard title="Nifty closes green" value="NO 47.9c" delay="0.4s" />
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

        <section className="container mx-auto px-4 py-14">
          <h2 className="text-2xl font-bold text-emerald-100">Trending Markets</h2>
          <p className="mt-2 text-sm text-emerald-200/70">
            See what traders are watching right now.
          </p>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {trending.map((market) => {
              const topOption = [...(market.options || [])].sort(
                (a, b) => b.current_price - a.current_price,
              )[0];
              return (
                <Link
                  key={market.id}
                  to={`/markets/${market.id}`}
                  className="rounded-xl border border-emerald-900/60 bg-slate-900 p-5 transition hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-900/30"
                >
                  <p className="text-xs uppercase tracking-wider text-emerald-300">
                    {market.category}
                  </p>
                  <h3 className="mt-2 line-clamp-2 text-lg font-bold text-emerald-100">
                    {market.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-emerald-200/80">{topOption?.label || 'Top side'}</span>
                    <span className="font-bold text-emerald-300">
                      {topOption ? `${topOption.current_price.toFixed(1)}c` : '--'}
                    </span>
                  </div>
                </Link>
              );
            })}
            {trending.length === 0 &&
              Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-emerald-900/60 bg-slate-900 p-5"
                >
                  <div className="h-4 w-24 animate-pulse rounded bg-emerald-900/70" />
                  <div className="mt-3 h-5 w-full animate-pulse rounded bg-emerald-900/60" />
                  <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-emerald-900/60" />
                </div>
              ))}
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
    </div>
  );
};
