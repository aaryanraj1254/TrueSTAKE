import React, { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MarketChart } from '../components/markets/MarketChart';
import { ArrowLeft, Clock, CheckCircle, Wallet } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { fetchMarket, fetchWalletMe, type WalletMeResponse, placeTrade } from '../lib/api';
import { toast } from '../lib/toast';

export const MarketDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [tradeMessage, setTradeMessage] = useState({ type: '', text: '' });
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('10');
  const queryClient = useQueryClient();

  const marketQuery = useQuery({
    queryKey: ['market', id],
    queryFn: () => fetchMarket(id ?? ''),
    enabled: Boolean(id),
    refetchInterval: 10_000,
  });

  const walletQuery = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: fetchWalletMe,
    enabled: Boolean(user),
  });

  const tradeMutation = useMutation({
    mutationFn: placeTrade,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['wallet', 'me'] });
      const previousWallet = queryClient.getQueryData<WalletMeResponse>(['wallet', 'me']);

      if (previousWallet) {
        queryClient.setQueryData<WalletMeResponse>(['wallet', 'me'], {
          ...previousWallet,
          wallet: {
            ...previousWallet.wallet,
            balance: Number(previousWallet.wallet.balance ?? 0) - payload.amount,
          },
        });
      }

      setTradeMessage({ type: '', text: '' });
      return { previousWallet };
    },
    onError: (_error: unknown, _payload, context) => {
      if (context?.previousWallet) {
        queryClient.setQueryData(['wallet', 'me'], context.previousWallet);
      }
      const message = 'Trade failed';
      setTradeMessage({ type: 'error', text: message });
      toast.error(message);
    },
    onSuccess: (_data, payload) => {
      const selectedOption = (marketQuery.data?.options || []).find(
        (option) => option.id === payload.option_id,
      );
      const estimate = selectedOption
        ? (payload.amount * (100 / Math.max(selectedOption.current_price, 1))).toFixed(2)
        : null;
      const message = estimate
        ? `Trade placed. Estimated payout: ${estimate} tokens`
        : 'Trade placed successfully';
      setTradeMessage({ type: 'success', text: message });
      toast.success(message);
      setAmount('10');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['market', id] });
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const handleTradeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      setTradeMessage({ type: 'error', text: 'Please login to trade' });
      return;
    }

    if (!id) {
      setTradeMessage({ type: 'error', text: 'Market is missing' });
      return;
    }

    const tradeAmount = Number(amount);
    if (!tradeAmount || tradeAmount <= 0) {
      setTradeMessage({ type: 'error', text: 'Enter a valid amount' });
      return;
    }

    const selectedOption = (marketQuery.data?.options || []).find(
      (option) => option.label.toLowerCase() === selectedSide,
    );
    if (!selectedOption?.id) {
      setTradeMessage({ type: 'error', text: `No ${selectedSide.toUpperCase()} option available` });
      return;
    }

    try {
      await tradeMutation.mutateAsync({
        market_id: id,
        option_id: selectedOption.id,
        amount: tradeAmount,
      });
    } catch {
      // Error messaging is handled by the mutation.
    }
  };

  const market = marketQuery.data;
  const wallet = walletQuery.data?.wallet;
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
  const yesOption =
    sortedOptions.find((option) => option.label.toLowerCase() === 'yes') || sortedOptions[0];
  const noOption =
    sortedOptions.find((option) => option.label.toLowerCase() === 'no') ||
    sortedOptions.find((option) => option.id !== yesOption?.id);
  const selectedOption = selectedSide === 'yes' ? yesOption : noOption;
  const amountNumber = Number(amount) || 0;
  const payoutEstimate = useMemo(() => {
    if (!selectedOption || amountNumber <= 0) return 0;
    return amountNumber * (100 / Math.max(selectedOption.current_price, 1));
  }, [selectedOption, amountNumber]);

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

              <form className="space-y-4" onSubmit={handleTradeSubmit}>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSide('yes')}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedSide === 'yes'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider">YES</p>
                    <p className="text-lg font-bold">
                      {yesOption ? `${yesOption.current_price.toFixed(1)}¢` : '--'}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSide('no')}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedSide === 'no'
                        ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300'
                        : 'border-border bg-background text-foreground'
                    }`}
                  >
                    <p className="text-xs font-semibold uppercase tracking-wider">NO</p>
                    <p className="text-lg font-bold">
                      {noOption ? `${noOption.current_price.toFixed(1)}¢` : '--'}
                    </p>
                  </button>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">Amount</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-foreground outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Enter amount"
                  />
                </div>

                <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                  Potential payout:{' '}
                  <span className="font-semibold text-foreground">
                    {payoutEstimate.toFixed(2)} tokens
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isClosed || tradeLoading || !selectedOption?.id}
                  className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {tradeLoading ? 'Placing trade...' : `Buy ${selectedSide.toUpperCase()}`}
                </button>
              </form>

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
