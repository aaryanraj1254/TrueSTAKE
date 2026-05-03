import { Request, Response } from 'express';
import { supabase } from '../services/supabase';

type MarketRow = {
  id: string;
  category: string;
  status: 'open' | 'closed' | 'resolved';
  created_at: string;
  options?: Array<{ total_staked?: number | string }>;
};

type TransactionRow = {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
  amount: number | string;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
  metadata?: Record<string, unknown>;
};

type TradeRow = {
  user_id: string;
  amount: number | string;
  created_at: string;
};

const asNumber = (value: number | string | undefined | null) => Number(value ?? 0);

export const listUsers = async (_req: Request, res: Response) => {
  const [
    { data: authData, error: authError },
    { data: bannedUsers, error: banError },
    { data: trades, error: tradeError },
  ] = await Promise.all([
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    supabase.from('banned_users').select('*'),
    supabase.from('trades').select('user_id, amount, created_at'),
  ]);

  if (authError) return res.status(500).json({ error: authError.message });
  if (banError) return res.status(500).json({ error: banError.message });
  if (tradeError) return res.status(500).json({ error: tradeError.message });

  const bannedMap = new Map((bannedUsers ?? []).map((ban) => [ban.user_id, ban]));
  const tradeRows = (trades ?? []) as TradeRow[];

  const users = (authData.users ?? []).map((user) => {
    const userTrades = tradeRows.filter((trade) => trade.user_id === user.id);
    return {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username,
      role: user.user_metadata?.role || 'user',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
      isBanned: bannedMap.has(user.id),
      totalTraded: userTrades.reduce((sum, trade) => sum + asNumber(trade.amount), 0),
      tradeCount: userTrades.length,
    };
  });

  return res.status(200).json(users);
};

export const banUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const { data, error } = await supabase
    .from('banned_users')
    .upsert({ user_id: id, reason: reason || 'Admin action', banned_by: req.user.id })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

export const unbanUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { error } = await supabase.from('banned_users').delete().eq('user_id', id);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ success: true });
};

export const listWithdrawals = async (_req: Request, res: Response) => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('type', 'withdrawal')
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data ?? []);
};

export const approveWithdrawal = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'completed' })
    .eq('id', id)
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

export const rejectWithdrawal = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data: transaction, error: findError } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('type', 'withdrawal')
    .eq('status', 'pending')
    .single();

  if (findError) return res.status(500).json({ error: findError.message });

  const withdrawal = transaction as TransactionRow;
  const { data: wallet, error: getWalletError } = await supabase
    .from('wallets')
    .select('balance')
    .eq('user_id', withdrawal.user_id)
    .single();

  if (getWalletError) return res.status(500).json({ error: getWalletError.message });

  const { error: updateWalletError } = await supabase
    .from('wallets')
    .update({ balance: asNumber(wallet.balance) + asNumber(withdrawal.amount) })
    .eq('user_id', withdrawal.user_id);

  if (updateWalletError) return res.status(500).json({ error: updateWalletError.message });

  const { data, error } = await supabase
    .from('transactions')
    .update({ status: 'failed' })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json(data);
};

export const getAnalytics = async (_req: Request, res: Response) => {
  const [
    { data: markets, error: marketError },
    { data: transactions, error: transactionError },
    { data: trades, error: tradeError },
    { data: authData, error: authError },
  ] = await Promise.all([
    supabase
      .from('markets')
      .select('id, category, status, created_at, options:market_options(total_staked)'),
    supabase.from('transactions').select('id, type, amount, status, created_at'),
    supabase.from('trades').select('user_id, amount, created_at'),
    supabase.auth.admin.listUsers({ page: 1, perPage: 1000 }),
  ]);

  if (marketError) return res.status(500).json({ error: marketError.message });
  if (transactionError) return res.status(500).json({ error: transactionError.message });
  if (tradeError) return res.status(500).json({ error: tradeError.message });
  if (authError) return res.status(500).json({ error: authError.message });

  const marketRows = (markets ?? []) as MarketRow[];
  const transactionRows = (transactions ?? []) as TransactionRow[];
  const tradeRows = (trades ?? []) as TradeRow[];
  const activeUsers = new Set(tradeRows.map((trade) => trade.user_id)).size;
  const totalVolume = tradeRows.reduce((sum, trade) => sum + asNumber(trade.amount), 0);
  const openMarkets = marketRows.filter((market) => market.status === 'open').length;

  const dailyVolumeMap = new Map<string, number>();
  tradeRows.forEach((trade) => {
    const day = new Date(trade.created_at).toISOString().slice(0, 10);
    dailyVolumeMap.set(day, (dailyVolumeMap.get(day) ?? 0) + asNumber(trade.amount));
  });

  const userGrowthMap = new Map<string, number>();
  authData.users.forEach((user) => {
    const day = new Date(user.created_at).toISOString().slice(0, 10);
    userGrowthMap.set(day, (userGrowthMap.get(day) ?? 0) + 1);
  });

  let runningUsers = 0;
  const userGrowth = Array.from(userGrowthMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => {
      runningUsers += count;
      return { date, users: runningUsers };
    });

  const categoryMap = new Map<string, number>();
  marketRows.forEach((market) => {
    categoryMap.set(market.category, (categoryMap.get(market.category) ?? 0) + 1);
  });

  return res.status(200).json({
    totals: {
      totalVolume,
      activeUsers,
      openMarkets,
      totalUsers: authData.users.length,
      pendingWithdrawals: transactionRows.filter(
        (item) => item.type === 'withdrawal' && item.status === 'pending',
      ).length,
    },
    dailyVolume: Array.from(dailyVolumeMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, volume]) => ({ date, volume })),
    userGrowth,
    categoryBreakdown: Array.from(categoryMap.entries()).map(([category, value]) => ({
      category,
      value,
    })),
  });
};
