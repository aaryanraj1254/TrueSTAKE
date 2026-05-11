import { type CreateMarketPayload, type Market } from '@truestake/shared';
import { apiClient } from './axios';

export interface DashboardTrade {
  id: string;
  amount: number | string;
  payout: number | string | null;
  outcome: 'pending' | 'won' | 'lost';
  created_at: string;
  market?: { title?: string; status?: string } | null;
  option?: { label?: string } | null;
}

export interface PortfolioResponse {
  trades: DashboardTrade[];
  summary: {
    totalStaked: number;
    realizedPayout: number;
    pnl: number;
    openTrades: number;
  };
}

export interface LeaderboardEntry {
  rank: number;
  user_id: string;
  displayName: string;
  totalPayout: number;
  totalBet: number;
  profit: number;
}

export interface ProfileStats {
  totalTraded: number;
  winRate: number;
  profit: number;
  tradesPlaced: number;
  pendingWithdrawals: number;
}

export interface AdminUser {
  id: string;
  email?: string;
  username?: string;
  role: string;
  created_at: string;
  last_sign_in_at?: string;
  isBanned: boolean;
  totalTraded: number;
  tradeCount: number;
}

export interface AdminWithdrawal {
  id: string;
  user_id: string;
  amount: number | string;
  status: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface AdminAnalytics {
  totals: {
    totalVolume: number;
    activeUsers: number;
    openMarkets: number;
    totalUsers: number;
    pendingWithdrawals: number;
  };
  dailyVolume: Array<{ date: string; volume: number }>;
  userGrowth: Array<{ date: string; users: number }>;
  categoryBreakdown: Array<{ category: string; value: number }>;
}

export interface TrendingMarket extends Market {
  volume: number;
}

export interface WalletRecord {
  user_id: string;
  balance: number | string;
}

export interface WalletMeResponse {
  wallet: WalletRecord;
  transactions: Array<{
    id: string;
    type: 'deposit' | 'withdrawal' | 'bet' | 'payout';
    amount: number | string;
    status: 'pending' | 'completed' | 'failed';
    metadata?: Record<string, unknown>;
    created_at: string;
  }>;
}

const api = apiClient;

export const fetchTrendingMarkets = async () => {
  const { data } = await api.get<TrendingMarket[]>('/dashboard/trending');
  return data;
};

export const fetchPortfolio = async () => {
  const { data } = await api.get<PortfolioResponse>('/dashboard/portfolio');
  return data;
};

export const fetchLeaderboard = async () => {
  const { data } = await api.get<LeaderboardEntry[]>('/dashboard/leaderboard');
  return data;
};

export const fetchProfileStats = async () => {
  const { data } = await api.get<ProfileStats>('/dashboard/profile');
  return data;
};

export const fetchMarket = async (id: string) => {
  const { data } = await api.get<Market>(`/markets/${id}`);
  return data;
};

export const fetchMarkets = async () => {
  const { data } = await api.get<Market[]>('/markets');
  return data;
};

export const placeTrade = async (payload: {
  market_id: string;
  option_id: string;
  amount: number;
}) => {
  const { data } = await api.post('/trades', payload);
  return data;
};

export const fetchWalletMe = async (): Promise<WalletMeResponse> => {
  const response = await apiClient.get<WalletMeResponse>('/wallet/me');
  return response.data;
};

export const redeemFunds = async (data: {
  amount: number;
  platform: string;
  account: string;
}): Promise<{ success: boolean; message: string }> => {
  const response = await apiClient.post<{ success: boolean; message: string }>(
    '/wallet/redeem',
    data,
  );
  return response.data;
};

export const fetchCelebrityTweets = async (filter?: string, search?: string): Promise<Tweet[]> => {
  const params = new URLSearchParams();
  if (filter && filter !== 'all') {
    params.append('category', filter);
  }
  if (search) {
    params.append('search', search);
  }

  const response = await api.get<Tweet[]>(`/celebrity-tweets?${params.toString()}`);
  return response.data;
};

export const fetchAdminMarkets = async () => {
  const { data } = await api.get<Market[]>('/admin/markets');
  return data;
};

export const createAdminMarket = async (payload: CreateMarketPayload) => {
  const { data } = await api.post<Market>('/admin/markets', payload);
  return data;
};

export const resolveAdminMarket = async (payload: {
  marketId: string;
  correct_outcome: string;
}) => {
  const { data } = await api.patch<Market>(`/admin/markets/${payload.marketId}/resolve`, {
    correct_outcome: payload.correct_outcome,
  });
  return data;
};

export const fetchAdminUsers = async () => {
  const { data } = await api.get<AdminUser[]>('/admin/users');
  return data;
};

export const setAdminUserBan = async (payload: { userId: string; banned: boolean }) => {
  const endpoint = payload.banned ? 'ban' : 'unban';
  const { data } = await api.post(`/admin/users/${payload.userId}/${endpoint}`);
  return data;
};

export const fetchAdminWithdrawals = async () => {
  const { data } = await api.get<AdminWithdrawal[]>('/admin/withdrawals');
  return data;
};

export const approveAdminWithdrawal = async (id: string) => {
  const { data } = await api.post<AdminWithdrawal>(`/admin/withdrawals/${id}/approve`);
  return data;
};

export const rejectAdminWithdrawal = async (id: string) => {
  const { data } = await api.post<AdminWithdrawal>(`/admin/withdrawals/${id}/reject`);
  return data;
};

export const fetchAdminAnalytics = async () => {
  const { data } = await api.get<AdminAnalytics>('/admin/analytics');
  return data;
};

export default api;
