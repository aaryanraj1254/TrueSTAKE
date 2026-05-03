import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { CreateTradeSchema } from '@truestake/shared';

export const placeTrade = async (req: Request, res: Response) => {
  const result = CreateTradeSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  const { market_id, option_id, amount } = result.data;
  const user_id = req.user.id;

  // Use the RPC function for atomic trade placement and AMM updates
  const { data, error } = await supabase.rpc('place_trade', {
    p_user_id: user_id,
    p_market_id: market_id,
    p_option_id: option_id,
    p_amount: amount,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json(data);
};

export const getMyTrades = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('trades')
    .select('*, market:markets(title), option:market_options(label)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const getMarketTrades = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('trades')
    .select('*, option:market_options(label)')
    .eq('market_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const getWallet = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  const { data, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user_id)
    .single();

  if (error && error.code !== 'PGRST116') {
    return res.status(500).json({ error: error.message });
  }

  // If wallet doesn't exist, it might be created on first trade, or we can create it here
  if (!data) {
    const { data: newWallet, error: createError } = await supabase
      .from('wallets')
      .insert({ user_id, balance: 1000 })
      .select()
      .single();

    if (createError) return res.status(500).json({ error: createError.message });
    return res.status(200).json(newWallet);
  }

  return res.status(200).json(data);
};
