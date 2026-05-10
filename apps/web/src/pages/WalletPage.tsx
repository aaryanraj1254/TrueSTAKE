import React, { useMemo, useState } from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Banknote,
  Building2,
  CreditCard,
  Landmark,
  Loader2,
  Phone,
  Plus,
  Wallet,
  Package,
  ShoppingBag,
  Shirt,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Skeleton, TableSkeleton } from '../components/Skeleton';
import { apiClient } from '../lib/axios';
import { fetchWalletMe, type WalletMeResponse } from '../lib/api';

type TransactionType = 'deposit' | 'withdrawal' | 'bet' | 'payout';
type TransactionStatus = 'pending' | 'completed' | 'failed';
type WithdrawPlatform =
  | 'gpay'
  | 'phonepe'
  | 'paytm'
  | 'bank'
  | 'amazon'
  | 'flipkart'
  | 'ajio'
  | 'paypal';

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

const formatAmount = (amount: number | string) => currency.format(Number(amount));

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));

const transactionTone: Record<TransactionStatus, string> = {
  completed: 'bg-green-500/10 text-green-700',
  pending: 'bg-amber-500/10 text-amber-700',
  failed: 'bg-red-500/10 text-red-700',
};

const transactionTypeTone: Record<TransactionType, string> = {
  deposit: 'bg-emerald-500/15 text-emerald-700',
  withdrawal: 'bg-orange-500/15 text-orange-700',
  bet: 'bg-blue-500/15 text-blue-700',
  payout: 'bg-purple-500/15 text-purple-700',
};

const typeLabel: Record<TransactionType, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  bet: 'Bet',
  payout: 'Payout',
};

const platforms: Array<{ value: WithdrawPlatform; label: string; icon: React.ElementType }> = [
  { value: 'gpay', label: 'GPay', icon: Phone },
  { value: 'phonepe', label: 'PhonePe', icon: Phone },
  { value: 'paytm', label: 'Paytm', icon: CreditCard },
  { value: 'bank', label: 'Bank', icon: Building2 },
  { value: 'amazon', label: 'Amazon', icon: Package },
  { value: 'flipkart', label: 'Flipkart', icon: ShoppingBag },
  { value: 'ajio', label: 'Ajio', icon: Shirt },
  { value: 'paypal', label: 'PayPal', icon: CreditCard },
];

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.error || fallback;
  }

  return fallback;
};

export const WalletPage: React.FC = () => {
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('500');
  const [withdrawAmount, setWithdrawAmount] = useState('250');
  const [withdrawPlatform, setWithdrawPlatform] = useState<WithdrawPlatform>('gpay');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<'deposit' | 'withdraw' | null>(null);

  const walletQuery = useQuery({
    queryKey: ['wallet', 'me'],
    queryFn: fetchWalletMe,
  });

  const wallet = (walletQuery.data as WalletMeResponse | undefined)?.wallet ?? null;
  const transactions = (walletQuery.data as WalletMeResponse | undefined)?.transactions ?? [];
  const isLoading = walletQuery.isLoading;
  const balance = useMemo(() => Number(wallet?.balance ?? 0), [wallet]);

  const handleDeposit = async () => {
    const amount = Number(depositAmount);
    if (!amount || amount < 1) {
      setMessage({ type: 'error', text: 'Enter a valid deposit amount' });
      return;
    }

    try {
      setActionLoading('deposit');
      setMessage(null);
      await apiClient.post('/wallet/deposit', {
        amount,
        provider: 'razorpay',
      });
      await walletQuery.refetch();
      setIsDepositOpen(false);
      setMessage({ type: 'success', text: 'Deposit completed through mock webhook' });
      toast.success('Deposit completed');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Deposit failed') });
      toast.error('Deposit failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleWithdraw = async (event: React.FormEvent) => {
    event.preventDefault();
    const amount = Number(withdrawAmount);
    if (!amount || amount < 1) {
      setMessage({ type: 'error', text: 'Enter a valid withdrawal amount' });
      return;
    }

    try {
      setActionLoading('withdraw');
      setMessage(null);
      await apiClient.post('/wallet/withdraw', {
        amount,
        platform: withdrawPlatform,
        account: withdrawAccount,
      });
      await walletQuery.refetch();
      setWithdrawAccount('');
      setMessage({ type: 'success', text: 'Withdrawal request is pending review' });
      toast.success('Withdrawal request submitted');
    } catch (error: unknown) {
      setMessage({ type: 'error', text: getErrorMessage(error, 'Withdrawal failed') });
      toast.error('Withdrawal failed');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto max-w-6xl space-y-6">
          <Skeleton className="h-40" />
          <TableSkeleton rows={6} columns={5} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            to="/markets"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Markets
          </Link>
          <button
            type="button"
            onClick={() => setIsDepositOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Deposit
          </button>
        </div>

        {message && (
          <div
            className={`mb-6 rounded-lg px-4 py-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-500/10 text-green-700'
                : 'bg-red-500/10 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Available balance</p>
                  <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-foreground">
                    {formatAmount(balance)}
                  </h1>
                </div>
                <div className="rounded-lg bg-primary/10 p-3 text-primary">
                  <Wallet className="h-6 w-6" />
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Deposits</p>
                  <p className="mt-1 font-semibold">
                    {formatAmount(
                      transactions
                        .filter((item) => item.type === 'deposit')
                        .reduce((sum, item) => sum + Number(item.amount), 0),
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Pending withdrawals</p>
                  <p className="mt-1 font-semibold">
                    {formatAmount(
                      transactions
                        .filter((item) => item.type === 'withdrawal' && item.status === 'pending')
                        .reduce((sum, item) => sum + Number(item.amount), 0),
                    )}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground">Payouts</p>
                  <p className="mt-1 font-semibold">
                    {formatAmount(
                      transactions
                        .filter((item) => item.type === 'payout')
                        .reduce((sum, item) => sum + Number(item.amount), 0),
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <div className="border-b border-border px-5 py-4">
                <h2 className="text-lg font-semibold">Transaction history</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Type</th>
                      <th className="px-5 py-3 font-semibold">Amount</th>
                      <th className="px-5 py-3 font-semibold">Status</th>
                      <th className="px-5 py-3 font-semibold">Details</th>
                      <th className="px-5 py-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {transactions.length === 0 ? (
                      <tr>
                        <td className="px-5 py-8 text-center text-muted-foreground" colSpan={5}>
                          No transactions yet.
                        </td>
                      </tr>
                    ) : (
                      transactions.map((item) => (
                        <tr key={item.id}>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transactionTypeTone[item.type]}`}
                            >
                              {typeLabel[item.type]}
                            </span>
                          </td>
                          <td className="px-5 py-4">{formatAmount(item.amount)}</td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transactionTone[item.status]}`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {item.metadata?.platform
                              ? String(item.metadata.platform).toUpperCase()
                              : item.metadata?.provider
                                ? String(item.metadata.provider)
                                : '-'}
                          </td>
                          <td className="px-5 py-4 text-muted-foreground">
                            {formatDate(item.created_at)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleWithdraw}
            className="h-fit rounded-lg border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Landmark className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Withdraw</h2>
            </div>

            <label className="text-sm font-medium" htmlFor="withdraw-amount">
              Amount
            </label>
            <input
              id="withdraw-amount"
              type="number"
              min="1"
              value={withdrawAmount}
              onChange={(event) => setWithdrawAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />

            <div className="mt-5">
              <p className="text-sm font-medium">Platform</p>
              <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                {platforms.map((platform) => {
                  const Icon = platform.icon;
                  const isSelected = withdrawPlatform === platform.value;
                  return (
                    <button
                      key={platform.value}
                      type="button"
                      onClick={() => setWithdrawPlatform(platform.value)}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${
                        isSelected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border hover:bg-accent'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {platform.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="mt-5 block text-sm font-medium" htmlFor="withdraw-account">
              UPI ID or bank details
            </label>
            <input
              id="withdraw-account"
              value={withdrawAccount}
              onChange={(event) => setWithdrawAccount(event.target.value)}
              placeholder={withdrawPlatform === 'bank' ? 'Account no / IFSC' : 'name@upi'}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              type="submit"
              disabled={actionLoading === 'withdraw'}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {actionLoading === 'withdraw' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Banknote className="h-4 w-4" />
              )}
              Request withdrawal
            </button>
          </form>
        </section>
      </main>

      {isDepositOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Deposit</h2>
              <button
                type="button"
                onClick={() => setIsDepositOpen(false)}
                className="rounded-lg px-2 py-1 text-muted-foreground hover:bg-accent"
              >
                Close
              </button>
            </div>

            <div className="mx-auto mb-5 grid h-44 w-44 grid-cols-6 gap-1 rounded-lg border border-border bg-white p-3">
              {Array.from({ length: 36 }).map((_, index) => (
                <span
                  key={index}
                  className={`rounded-sm ${
                    index % 2 === 0 || index % 7 === 0 || [1, 4, 25, 30, 34].includes(index)
                      ? 'bg-black'
                      : 'bg-white'
                  }`}
                />
              ))}
            </div>

            <label className="text-sm font-medium" htmlFor="deposit-amount">
              Amount
            </label>
            <input
              id="deposit-amount"
              type="number"
              min="1"
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              className="mt-2 w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />

            <button
              type="button"
              onClick={handleDeposit}
              disabled={actionLoading === 'deposit'}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {actionLoading === 'deposit' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Confirm mock payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
