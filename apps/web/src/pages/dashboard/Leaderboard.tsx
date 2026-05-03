import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Medal } from 'lucide-react';
import { fetchLeaderboard } from '../../lib/api';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const Leaderboard: React.FC = () => {
  const { data: leaders = [] } = useQuery({
    queryKey: ['dashboard', 'leaderboard'],
    queryFn: fetchLeaderboard,
    refetchInterval: 30_000,
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Leaderboard</h1>
        <p className="mt-1 text-muted-foreground">
          Top earners ranked by completed payouts minus bets.
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">Rank</th>
              <th className="px-5 py-3">Trader</th>
              <th className="px-5 py-3">Payouts</th>
              <th className="px-5 py-3">Bets</th>
              <th className="px-5 py-3">Profit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {leaders.map((leader) => (
              <tr key={leader.user_id}>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 font-bold">
                    {leader.rank <= 3 && <Medal className="h-4 w-4 text-amber-600" />}#{leader.rank}
                  </span>
                </td>
                <td className="px-5 py-4 font-medium">{leader.displayName}</td>
                <td className="px-5 py-4">{money(leader.totalPayout)}</td>
                <td className="px-5 py-4">{money(leader.totalBet)}</td>
                <td
                  className={`px-5 py-4 font-bold ${leader.profit >= 0 ? 'text-green-700' : 'text-red-700'}`}
                >
                  {money(leader.profit)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};
