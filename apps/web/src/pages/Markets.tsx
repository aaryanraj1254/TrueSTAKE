import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { MarketList } from '../components/markets/MarketList';
import { useAuth } from '../hooks/useAuth';

export const Markets: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Markets</h1>
            <p className="text-muted-foreground mt-2">
              Predict outcomes on politics, sports, crypto, and more.
            </p>
          </div>
          {user && (
            <div className="flex gap-2">
              <Link
                to="/dashboard"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
              >
                Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
                >
                  Admin
                </Link>
              )}
              <Link
                to="/wallet"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-accent"
              >
                <Wallet className="h-4 w-4" />
                Wallet
              </Link>
            </div>
          )}
        </div>
        <MarketList />
      </main>
    </div>
  );
};
