-- TrueStake RLS policies for direct client access patterns.

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Wallets: users can only access their own wallet rows.
DROP POLICY IF EXISTS "wallets_select_own" ON wallets;
DROP POLICY IF EXISTS "wallets_update_own" ON wallets;
CREATE POLICY "wallets_select_own"
  ON wallets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "wallets_update_own"
  ON wallets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Trades: users can view/insert their own trades.
DROP POLICY IF EXISTS "trades_select_own" ON trades;
DROP POLICY IF EXISTS "trades_insert_own" ON trades;
CREATE POLICY "trades_select_own"
  ON trades
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "trades_insert_own"
  ON trades
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Markets: readable by everyone, write access reserved for service role.
DROP POLICY IF EXISTS "markets_select_public" ON markets;
CREATE POLICY "markets_select_public"
  ON markets
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Transactions: users can only access their own transactions.
DROP POLICY IF EXISTS "transactions_select_own" ON transactions;
CREATE POLICY "transactions_select_own"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

