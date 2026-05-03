import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MarketChart } from '../components/markets/MarketChart';
import { ArrowLeft, Clock, CheckCircle, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchMarket, placeTrade } from '../lib/api';
import { toast } from 'sonner';

interface WalletRecord {
  balance: number | string;
}

export const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' });
  const queryClient = useQueryClient();

  const marketQuery = useQuery({
    queryKey: ['market', id],
    queryFn: () => fetchMarket(id ?? ''),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });

  const walletQuery = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const walletRes = await axios.get<WalletRecord>(`${import.meta.env.VITE_API_URL}/wallet`);
      return walletRes.data;
    },
    enabled: Boolean(user),
  });

  const tradeMutation = useMutation({
    mutationFn: placeTrade,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['wallet'] });
      const previousWallet = queryClient.getQueryData<WalletRecord>(['wallet']);

      if (previousWallet) {
        queryClient.setQueryData(['wallet'], {
          ...previousWallet,
          balance: Number(previousWallet.balance ?? 0) - payload.amount,
        });
      }

      setTradeMessage({ type: '', text: '' });
      return { previousWallet };
    },
    onError: (err: unknown, _payload, context) => {
      if (context?.previousWallet) {
        queryClient.setQueryData(['wallet'], context.previousWallet);
      }
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'Trade failed'
        : 'Trade failed';
      setTradeMessage({ type: 'error', text: message });
      toast.error(message);
    },
    onSuccess: () => {
      setTradeMessage({ type: 'success', text: 'Trade placed successfully!' });
      toast.success('Trade placed');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['market', id] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleBuy = async (optionId: string, amount: number) => {
    if (!user) {
      setTradeMessage({ type: 'error', text: 'Please login to trade' });
      return;
    }

    if (!id) {
      setTradeMessage({ type: 'error', text: 'Market is missing' });
      return;
    }

    try {
      await tradeMutation.mutateAsync({
        market_id: id,
        option_id: optionId,
        amount,
      });
    } catch {
      // Error messaging is handled by the mutation.
    }
  };

  const market = marketQuery.data;
  const wallet = walletQuery.data;
  const loading = marketQuery.isLoading || walletQuery.isLoading;
  const tradeLoading = tradeMutation.isPending;

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (marketQuery.error || !market) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-background space-y-4">
        <div className="text-xl text-destructive">Market not found</div>
        <Link to="/markets" className="text-primary hover:underline">
          Return to markets
        </Link>
      </div>
    );
  }

  const isClosed = new Date(market.closes_at) < new Date() || market.status !== 'open';
  const sortedOptions = [...(market.options || [])].sort(
    (a, b) => b.current_price - a.current_price,
  );

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/markets"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Markets
          </Link>
          {user && wallet && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-lg text-sm font-medium">
              <Wallet className="w-4 h-4 text-primary" />
              <span>{Number(wallet.balance).toFixed(2)} tokens</span>
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-8">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-semibold text-primary/80 uppercase tracking-wider bg-primary/10 px-2 py-1 rounded">
                  {market.category}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded flex items-center ${isClosed ? 'bg-muted text-muted-foreground' : 'bg-green-500/10 text-green-500'}`}
                >
                  {isClosed ? (
                    <CheckCircle className="w-4 h-4 mr-1" />
                  ) : (
                    <Clock className="w-4 h-4 mr-1" />
                  )}
                  {market.status.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight mb-4">
                {market.title}
              </h1>
              {market.description && (
                <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                  {market.description}
                </p>
              )}
            </div>

            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-6 text-foreground">Price History</h3>
              <MarketChart options={market.options ?? []} />
            </div>
          </div>

          <div className="w-full md:w-80 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm sticky top-8">
              <h3 className="font-semibold text-foreground border-b border-border pb-3 mb-4">
                Trade
              </h3>

              {tradeMessage.text && (
                <div
                  className={`mb-4 p-3 rounded text-sm ${tradeMessage.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}
                >
                  {tradeMessage.text}
                </div>
              )}

              <div className="space-y-4">
                {sortedOptions.map((opt) => {
                  const isWinner = market.correct_outcome === opt.id;
                  return (
                    <div
                      key={opt.id}
                      className={`flex flex-col p-4 rounded-lg border ${isWinner ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-foreground">{opt.label}</span>
                        <span className="font-bold text-xl text-foreground">
                          {opt.current_price.toFixed(1)}¢
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          disabled={isClosed || tradeLoading || !opt.id}
                          onClick={() => opt.id && handleBuy(opt.id, 10)}
                          className="flex-1 py-2.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 font-bold text-sm transition-all active:scale-95"
                        >
                          Buy 10¢
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border text-sm text-center text-muted-foreground">
                Total Volume:{' '}
                {(market.options ?? [])
                  .reduce((acc, opt) => acc + Number(opt.total_staked ?? 0), 0)
                  .toFixed(0)}{' '}
                tokens
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
