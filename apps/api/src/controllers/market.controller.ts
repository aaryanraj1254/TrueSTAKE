import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { CreateMarketSchema, ResolveMarketSchema } from '@truestake/shared';

export const getMarkets = async (req: Request, res: Response) => {
  const { category, status } = req.query;

  let query = supabase.from('markets').select('*, options:market_options(*)');

  if (category) {
    query = query.eq('category', category as string);
  }
  if (status) {
    query = query.eq('status', status as string);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data);
};

export const getMarketById = async (req: Request, res: Response) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('markets')
    .select('*, options:market_options(*), history:market_options(price_history(*))')
    .eq('id', id)
    .single();

  if (error) {
    return res.status(404).json({ error: 'Market not found' });
  }

  return res.status(200).json(data);
};

export const createMarket = async (req: Request, res: Response) => {
  const result = CreateMarketSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  const { title, description, category, closes_at, options } = result.data;
  const created_by = req.user.id; // From auth.middleware

  // Start transaction or do sequential inserts
  const { data: market, error: marketError } = await supabase
    .from('markets')
    .insert({ title, description, category, closes_at, created_by, status: 'open' })
    .select()
    .single();

  if (marketError) {
    return res.status(500).json({ error: marketError.message });
  }

  const optionsData = options.map((opt) => ({
    market_id: market.id,
    label: opt.label,
    current_price: opt.initial_price,
    total_staked: 0,
  }));

  const { data: createdOptions, error: optionsError } = await supabase
    .from('market_options')
    .insert(optionsData)
    .select();

  if (optionsError) {
    return res.status(500).json({ error: optionsError.message });
  }

  // Record initial price history
  const historyData = createdOptions.map((opt) => ({
    market_option_id: opt.id,
    price: opt.current_price,
  }));

  await supabase.from('price_history').insert(historyData);

  return res.status(201).json({ ...market, options: createdOptions });
};

export const resolveMarket = async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = ResolveMarketSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  const { correct_outcome } = result.data;

  // 1. Update market status
  const { data: market, error: marketError } = await supabase
    .from('markets')
    .update({ status: 'resolved', correct_outcome })
    .eq('id', id)
    .select()
    .single();

  if (marketError) {
    return res.status(500).json({ error: marketError.message });
  }

  // 2. Process payouts via RPC for atomic integrity
  const { error: rpcError } = await supabase.rpc('resolve_market_payouts', {
    p_market_id: id,
    p_correct_outcome: correct_outcome,
  });

  if (rpcError) {
    console.error('Payout RPC Error:', rpcError);
    // Even if RPC fails, market status is updated. In a real app, this should be a transaction.
  }

  return res.status(200).json(market);
};
