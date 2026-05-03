import { Request, Response } from 'express';
import { DepositSchema, WithdrawSchema } from '@truestake/shared';
import { supabase } from '../services/supabase';

const STARTING_BALANCE = 1000;

const toNumber = (value: unknown) => Number(value ?? 0);

const getOrCreateWallet = async (user_id: string) => {
  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(error.message);
  }

  if (data) {
    return data;
  }

  const { data: wallet, error: createError } = await supabase
    .from('wallets')
    .insert({ user_id, balance: STARTING_BALANCE })
    .select()
    .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return wallet;
};

export const getMyWallet = async (req: Request, res: Response) => {
  try {
    const user_id = req.user.id;
    const wallet = await getOrCreateWallet(user_id);

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({ wallet, transactions: transactions ?? [] });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Failed to load wallet' });
  }
};

export const deposit = async (req: Request, res: Response) => {
  const result = DepositSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  try {
    const user_id = req.user.id;
    const { amount, provider, mockPaymentId } = result.data;
    const wallet = await getOrCreateWallet(user_id);
    const nextBalance = toNumber(wallet.balance) + amount;

    const { data: updatedWallet, error: walletError } = await supabase
      .from('wallets')
      .update({ balance: nextBalance })
      .eq('user_id', user_id)
      .select()
      .single();

    if (walletError) {
      return res.status(500).json({ error: walletError.message });
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        type: 'deposit',
        amount,
        status: 'completed',
        metadata: {
          provider,
          mockPaymentId: mockPaymentId ?? `mock_${provider}_${Date.now()}`,
          webhook: 'mock',
        },
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: transactionError.message });
    }

    return res.status(201).json({ wallet: updatedWallet, transaction });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Deposit failed' });
  }
};

export const withdraw = async (req: Request, res: Response) => {
  const result = WithdrawSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  try {
    const user_id = req.user.id;
    const { amount, platform, account } = result.data;
    const wallet = await getOrCreateWallet(user_id);
    const balance = toNumber(wallet.balance);

    if (balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    const { data: updatedWallet, error: walletError } = await supabase
      .from('wallets')
      .update({ balance: balance - amount })
      .eq('user_id', user_id)
      .select()
      .single();

    if (walletError) {
      return res.status(500).json({ error: walletError.message });
    }

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id,
        type: 'withdrawal',
        amount,
        status: 'pending',
        metadata: {
          platform,
          account,
          requestedAt: new Date().toISOString(),
        },
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(500).json({ error: transactionError.message });
    }

    return res.status(202).json({ wallet: updatedWallet, transaction });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error instanceof Error ? error.message : 'Withdrawal failed' });
  }
};
