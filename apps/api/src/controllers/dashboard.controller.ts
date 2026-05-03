import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

type TransactionRow = {
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
  amount: number | string;
  status: 'pending' | 'completed' | 'failed';
};

type TradeRow = {
  id: string;
  amount: number | string;
  payout: number | string | null;
  outcome: 'pending' | 'won' | 'lost';
  created_at: string;
  market?: { title?: string; status?: string } | null;
  option?: { label?: string } | null;
};

const asNumber = (value: number | string | null | undefined) => Number(value ?? 0);

export const getTrendingMarkets = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('markets')
    .select('*, options:market_options(*)')
    .eq('status', 'open')
    .order('created_at', { ascending: false })
    .limit(12);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const markets = (data ?? [])
    .map((market) => ({
      ...market,
      volume: (market.options ?? []).reduce(
        (sum: number, option: { total_staked?: number | string }) =>
          sum + asNumber(option.total_staked),
        0,
      ),
    }))
    .sort((a, b) => b.volume - a.volume);

  return res.status(200).json(markets);
};

export const getPortfolio = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('trades')
    .select('*, market:markets(title, status), option:market_options(label)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const trades = (data ?? []) as TradeRow[];
  const totalStaked = trades.reduce((sum, trade) => sum + asNumber(trade.amount), 0);
  const realizedPayout = trades.reduce((sum, trade) => sum + asNumber(trade.payout), 0);

  return res.status(200).json({
    trades,
    summary: {
      totalStaked,
      realizedPayout,
      pnl: realizedPayout - totalStaked,
      openTrades: trades.filter((trade) => trade.outcome === 'pending').length,
    },
  });
};

export const getLeaderboard = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('user_id, type, amount, status')
    .eq('status', 'completed');

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const byUser = new Map<
    string,
    { user_id: string; totalPayout: number; totalBet: number; profit: number }
  >();

  ((data ?? []) as TransactionRow[]).forEach((transaction) => {
    const current = byUser.get(transaction.user_id) ?? {
      user_id: transaction.user_id,
      totalPayout: 0,
      totalBet: 0,
      profit: 0,
    };

    if (transaction.type === 'payout') {
      current.totalPayout += asNumber(transaction.amount);
    }
    if (transaction.type === 'bet') {
      current.totalBet += asNumber(transaction.amount);
    }

    current.profit = current.totalPayout - current.totalBet;
    byUser.set(transaction.user_id, current);
  });

  const leaders = Array.from(byUser.values())
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 20)
    .map((leader, index) => ({
      ...leader,
      rank: index + 1,
      displayName: `Trader ${leader.user_id.slice(0, 8)}`,
    }));

  return res.status(200).json(leaders);
};

export const getProfileStats = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  const { data: trades, error: tradeError } = await supabase
    .from('trades')
    .select('amount, payout, outcome')
    .eq('user_id', user_id);

  if (tradeError) {
    return res.status(500).json({ error: tradeError.message });
  }

  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('type, amount, status')
    .eq('user_id', user_id);

  if (transactionError) {
    return res.status(500).json({ error: transactionError.message });
  }

  const myTrades = (trades ?? []) as TradeRow[];
  const completedTrades = myTrades.filter((trade) => trade.outcome !== 'pending');
  const wins = completedTrades.filter((trade) => trade.outcome === 'won').length;
  const totalTraded = myTrades.reduce((sum, trade) => sum + asNumber(trade.amount), 0);
  const payouts = myTrades.reduce((sum, trade) => sum + asNumber(trade.payout), 0);
  const pendingWithdrawals = ((transactions ?? []) as TransactionRow[])
    .filter((transaction) => transaction.type === 'withdrawal' && transaction.status === 'pending')
    .reduce((sum, transaction) => sum + asNumber(transaction.amount), 0);

  return res.status(200).json({
    totalTraded,
    winRate: completedTrades.length ? (wins / completedTrades.length) * 100 : 0,
    profit: payouts - totalTraded,
    tradesPlaced: myTrades.length,
    pendingWithdrawals,
  });
};
