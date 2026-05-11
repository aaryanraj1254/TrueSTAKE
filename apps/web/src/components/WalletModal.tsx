import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Wallet, TrendingUp, BarChart3, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWalletMe, redeemFunds } from '../lib/api';
import { toast } from '../lib/toast';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatAmount = (amount: number | string) => currency.format(Number(amount));

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const platforms = [
  { name: 'PhonePe', logo: '📱', minAmount: 100 },
  { name: 'GPay', logo: '💚', minAmount: 100 },
  { name: 'Paytm', logo: '💰', minAmount: 100 },
  { name: 'Amazon', logo: '📦', minAmount: 500 },
  { name: 'Flipkart', logo: '🛍', minAmount: 500 },
  { name: 'Ajio', logo: '👕', minAmount: 500 },
  { name: 'PayPal', logo: '💳', minAmount: 1000 },
  { name: 'Myntra', logo: '👗', minAmount: 500 },
];

export const WalletModal: React.FC<WalletModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'balance' | 'redeem' | 'history'>('balance');
  const [selectedPlatform, setSelectedPlatform] = useState(platforms[0]);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [redeemAccount, setRedeemAccount] = useState('');
  const queryClient = useQueryClient();

  const { data: walletData } = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: fetchWalletMe,
    enabled: isOpen,
  });

  const balance = Number(walletData?.wallet?.balance ?? 0);
  const transactions = walletData?.transactions ?? [];
  const redeemHistory = transactions.filter((t) => t.type === 'withdrawal' && t.metadata?.platform);

  const redeemMutation = useMutation({
    mutationFn: redeemFunds,
    onSuccess: () => {
      toast.success('Redemption request submitted successfully');
      setRedeemAmount('');
      setRedeemAccount('');
      queryClient.invalidateQueries({ queryKey: ['wallet', 'me'] });
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Redemption failed';
      toast.error(errorMessage);
    },
  });

  const handleRedeem = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = Number(redeemAmount);
    if (!amount || amount < selectedPlatform.minAmount) {
      toast.error(`Minimum amount is ${selectedPlatform.minAmount}`);
      return;
    }

    if (amount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    redeemMutation.mutate({
      amount,
      platform: selectedPlatform.name.toLowerCase(),
      account: redeemAccount,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
      <div className="w-full max-w-5xl rounded-2xl border border-emerald-800/30 bg-gradient-to-br from-slate-900/95 to-slate-800/90 backdrop-blur-2xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-800/30 p-6">
          <h2 className="text-2xl font-bold text-emerald-100">My Wallet</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-emerald-200/60 hover:bg-emerald-900/30 hover:text-emerald-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-800/30">
          {['balance', 'redeem', 'history'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as 'balance' | 'redeem' | 'history')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-emerald-400 border-b-2 border-emerald-400'
                  : 'text-emerald-200/60 hover:text-emerald-100'
              }`}
            >
              {tab === 'balance' && ''}
              {tab === 'redeem' && ''}
              {tab === 'history' && ''}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'balance' && (
            <div className="rounded-xl border border-emerald-800/30 bg-gradient-to-br from-emerald-500/10 to-transparent p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-200/80">Available Balance</p>
                  <p className="mt-2 text-3xl font-bold text-emerald-100">
                    {formatAmount(balance)}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-500/20 p-3 text-emerald-400">
                  <Wallet className="h-8 w-8" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'redeem' && (
            <div>
              {/* Platform Grid */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-emerald-100 mb-4">Select Platform</h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {platforms.map((platform) => (
                    <button
                      key={platform.name}
                      onClick={() => setSelectedPlatform(platform)}
                      className={`flex flex-col items-center gap-2 rounded-lg border p-4 transition-all ${
                        selectedPlatform.name === platform.name
                          ? 'border-emerald-500 bg-emerald-500/20 text-emerald-100 scale-105'
                          : 'border-emerald-800/30 bg-slate-900/50 text-emerald-200 hover:border-emerald-600/50 hover:bg-emerald-900/50'
                      }`}
                    >
                      <div className="text-2xl">{platform.logo}</div>
                      <div className="text-sm font-medium">{platform.name}</div>
                      <div className="text-xs text-emerald-200/60">Min: {platform.minAmount}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Redeem Form */}
              <form onSubmit={handleRedeem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">Amount</label>
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder={`Enter amount (Min: ${selectedPlatform.minAmount})`}
                    className="w-full rounded-lg border border-emerald-800/30 bg-slate-900/50 px-4 py-3 text-emerald-100 placeholder-emerald-200/50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    min={selectedPlatform.minAmount}
                    max={balance}
                    step="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    {selectedPlatform.name === 'PayPal' ? 'Email' : 'UPI ID'}
                  </label>
                  <input
                    type="text"
                    value={redeemAccount}
                    onChange={(e) => setRedeemAccount(e.target.value)}
                    placeholder={
                      selectedPlatform.name === 'PayPal' ? 'email@example.com' : 'name@upi'
                    }
                    className="w-full rounded-lg border border-emerald-800/30 bg-slate-900/50 px-4 py-3 text-emerald-100 placeholder-emerald-200/50 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={redeemMutation.isPending || !redeemAmount || !redeemAccount}
                  className="w-full rounded-lg bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {redeemMutation.isPending
                    ? 'Processing...'
                    : `Redeem via ${selectedPlatform.name}`}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="rounded-xl border border-emerald-800/30 bg-slate-900/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-semibold text-emerald-100">Redemption History</h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {redeemHistory.length === 0 ? (
                  <p className="text-center text-emerald-200/60 py-8">No redemption history</p>
                ) : (
                  redeemHistory.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-800/20 bg-slate-800/50 p-3"
                    >
                      <div>
                        <p className="font-medium text-emerald-100 capitalize">
                          {transaction.metadata?.platform || 'Unknown'}
                        </p>
                        <p className="text-sm text-emerald-200/60">
                          {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`font-bold ${
                            transaction.status === 'completed'
                              ? 'text-emerald-400'
                              : transaction.status === 'pending'
                                ? 'text-amber-400'
                                : 'text-red-400'
                          }`}
                        >
                          {formatAmount(transaction.amount)}
                        </p>
                        <p className="text-xs text-emerald-200/60">{transaction.status}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 border-t border-emerald-800/30 p-6">
          <Link
            to="/markets"
            className="flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-4 py-2 text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-600/50 transition-colors"
          >
            <TrendingUp className="h-4 w-4" />
            <span className="font-medium">Browse Markets</span>
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 rounded-lg border border-emerald-700/50 bg-emerald-900/30 px-4 py-2 text-emerald-200 hover:bg-emerald-900/50 hover:border-emerald-600/50 transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link
            to="/wallet"
            className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-slate-950 font-medium hover:bg-emerald-400 transition-colors"
          >
            <Wallet className="h-4 w-4" />
            <span>Full Wallet</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
