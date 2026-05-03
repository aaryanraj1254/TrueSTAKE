import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type LoginCredentials = z.infer<typeof LoginSchema>;
export type RegisterCredentials = z.infer<typeof RegisterSchema>;

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email?: string;
    username?: string;
    role: string;
  };
}

export const MarketOptionSchema = z.object({
  id: z.string().uuid().optional(),
  market_id: z.string().uuid().optional(),
  label: z.string().min(1),
  current_price: z.number().min(0).max(100),
  total_staked: z.number().min(0).optional(),
});

export const MarketSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().min(3),
  description: z.string().optional(),
  category: z.string(),
  closes_at: z.string().or(z.date()),
  status: z.enum(['open', 'closed', 'resolved']),
  correct_outcome: z.string().uuid().optional().nullable(),
  created_by: z.string().uuid().optional(),
  created_at: z.string().optional(),
  options: z.array(MarketOptionSchema).optional(),
});

export const CreateMarketSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  closes_at: z.string(),
  options: z
    .array(
      z.object({
        label: z.string().min(1, 'Label is required'),
        initial_price: z.number().min(1).max(99),
      }),
    )
    .min(2, 'At least two options are required'),
});

export const ResolveMarketSchema = z.object({
  correct_outcome: z.string().uuid('Invalid outcome ID'),
});

export const WalletSchema = z.object({
  user_id: z.string().uuid(),
  balance: z.number().min(0),
});

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  type: z.enum(['deposit', 'withdrawal', 'bet', 'payout']),
  amount: z.number().positive(),
  status: z.enum(['pending', 'completed', 'failed']),
  metadata: z.record(z.unknown()).nullable().optional(),
  created_at: z.string(),
});

export const WalletMeSchema = z.object({
  wallet: WalletSchema,
  transactions: z.array(TransactionSchema),
});

export const DepositSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  provider: z.enum(['razorpay', 'stripe']).default('razorpay'),
  mockPaymentId: z.string().optional(),
});

export const WithdrawSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least 1'),
  platform: z.enum(['gpay', 'phonepe', 'paytm', 'bank']),
  account: z.string().min(3, 'Payment account is required'),
});

export const TradeSchema = z.object({
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  market_id: z.string().uuid(),
  option_id: z.string().uuid(),
  amount: z.number().min(1),
  price_at_trade: z.number(),
  outcome: z.enum(['pending', 'won', 'lost']),
  payout: z.number().optional(),
  created_at: z.string().optional(),
});

export const CreateTradeSchema = z.object({
  market_id: z.string().uuid(),
  option_id: z.string().uuid(),
  amount: z.number().min(1, 'Amount must be at least 1'),
});

export type MarketOption = z.infer<typeof MarketOptionSchema>;
export type Market = z.infer<typeof MarketSchema>;
export type CreateMarketPayload = z.infer<typeof CreateMarketSchema>;
export type Wallet = z.infer<typeof WalletSchema>;
export type Transaction = z.infer<typeof TransactionSchema>;
export type WalletMe = z.infer<typeof WalletMeSchema>;
export type DepositPayload = z.infer<typeof DepositSchema>;
export type WithdrawPayload = z.infer<typeof WithdrawSchema>;
export type Trade = z.infer<typeof TradeSchema>;
export type CreateTradePayload = z.infer<typeof CreateTradeSchema>;

export const CONSTANTS = {
  APP_NAME: 'TrueStake',
};
