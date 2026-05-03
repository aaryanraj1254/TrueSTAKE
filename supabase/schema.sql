-- Supabase Schema for Opinion Market

CREATE TABLE IF NOT EXISTS markets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    closes_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'resolved')),
    correct_outcome UUID, -- References market_options(id) when resolved
    created_by UUID NOT NULL, -- References auth.users(id)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS market_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    current_price NUMERIC NOT NULL DEFAULT 50.00 CHECK (current_price >= 0 AND current_price <= 100),
    total_staked NUMERIC NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    market_option_id UUID NOT NULL REFERENCES market_options(id) ON DELETE CASCADE,
    price NUMERIC NOT NULL CHECK (price >= 0 AND price <= 100),
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies can be added here if frontend queries directly, but since we use backend endpoints as proxy:
-- (Optional) If you want direct read access for frontend via Supabase JS
-- ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Markets are viewable by everyone." ON markets FOR SELECT USING (true);
-- ALTER TABLE market_options ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Market options are viewable by everyone." ON market_options FOR SELECT USING (true);
-- ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Price history is viewable by everyone." ON price_history FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS wallets (
    user_id UUID PRIMARY KEY, -- References auth.users(id)
    balance NUMERIC NOT NULL DEFAULT 1000.00 CHECK (balance >= 0)
);

CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES wallets(user_id),
    type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'bet', 'payout')),
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS transactions_user_created_at_idx
    ON transactions(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS banned_users (
    user_id UUID PRIMARY KEY,
    reason TEXT,
    banned_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their wallet"
    ON wallets FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their transactions"
    ON transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their trades"
    ON trades FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their trades"
    ON trades FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    market_id UUID NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    option_id UUID NOT NULL REFERENCES market_options(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL CHECK (amount > 0),
    price_at_trade NUMERIC NOT NULL,
    outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('pending', 'won', 'lost')),
    payout NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RPC for atomic trade placement and AMM updates
CREATE OR REPLACE FUNCTION place_trade(
    p_user_id UUID,
    p_market_id UUID,
    p_option_id UUID,
    p_amount NUMERIC
) RETURNS JSON AS $$
DECLARE
    v_wallet_balance NUMERIC;
    v_market_status TEXT;
    v_option_exists BOOLEAN;
    v_current_price NUMERIC;
    v_total_stake NUMERIC;
    v_new_total_staked NUMERIC;
    v_trade_id UUID;
    v_option RECORD;
BEGIN
    -- 1. Check market status
    SELECT status INTO v_market_status FROM markets WHERE id = p_market_id;
    IF v_market_status != 'open' THEN
        RAISE EXCEPTION 'Market is not open';
    END IF;

    -- 2. Check option exists and belongs to market
    SELECT EXISTS(SELECT 1 FROM market_options WHERE id = p_option_id AND market_id = p_market_id) INTO v_option_exists;
    IF NOT v_option_exists THEN
        RAISE EXCEPTION 'Invalid option';
    END IF;

    -- 3. Check wallet balance
    SELECT balance INTO v_wallet_balance FROM wallets WHERE user_id = p_user_id FOR UPDATE;
    IF v_wallet_balance IS NULL THEN
        -- Create wallet if missing for testing
        INSERT INTO wallets (user_id, balance) VALUES (p_user_id, 1000) RETURNING balance INTO v_wallet_balance;
    END IF;

    IF v_wallet_balance < p_amount THEN
        RAISE EXCEPTION 'Insufficient balance';
    END IF;

    -- 4. Deduct wallet
    UPDATE wallets SET balance = balance - p_amount WHERE user_id = p_user_id;

    -- 5. Record the trade at CURRENT price
    SELECT current_price INTO v_current_price FROM market_options WHERE id = p_option_id;
    
    INSERT INTO trades (user_id, market_id, option_id, amount, price_at_trade, outcome)
    VALUES (p_user_id, p_market_id, p_option_id, p_amount, v_current_price, 'pending')
    RETURNING id INTO v_trade_id;

    -- 6. Update option stake
    UPDATE market_options SET total_staked = total_staked + p_amount WHERE id = p_option_id;

    -- 6.5 Record transaction
    INSERT INTO transactions (user_id, type, amount, status, metadata)
    VALUES (p_user_id, 'bet', p_amount, 'completed', json_build_object('market_id', p_market_id, 'option_id', p_option_id, 'trade_id', v_trade_id));

    -- 7. AMM: Update all options prices in the market
    SELECT SUM(total_staked) INTO v_total_stake FROM market_options WHERE market_id = p_market_id;
    
    IF v_total_stake > 0 THEN
        FOR v_option IN SELECT id, total_staked FROM market_options WHERE market_id = p_market_id LOOP
            v_new_total_staked := v_option.total_staked;
            -- Update price
            UPDATE market_options 
            SET current_price = (v_new_total_staked / v_total_stake) * 100 
            WHERE id = v_option.id;

            -- Record price history
            INSERT INTO price_history (market_option_id, price) 
            VALUES (v_option.id, (v_new_total_staked / v_total_stake) * 100);
        END LOOP;
    END IF;

    RETURN json_build_object('success', true, 'trade_id', v_trade_id);
END;
$$ LANGUAGE plpgsql;

-- RPC for atomic market resolution and payouts
CREATE OR REPLACE FUNCTION resolve_market_payouts(
    p_market_id UUID,
    p_correct_outcome UUID
) RETURNS JSON AS $$
DECLARE
    v_trade RECORD;
    v_payout NUMERIC;
BEGIN
    -- Only process pending trades for this market
    FOR v_trade IN 
        SELECT id, user_id, option_id, amount, price_at_trade 
        FROM trades 
        WHERE market_id = p_market_id AND outcome = 'pending'
    LOOP
        IF v_trade.option_id = p_correct_outcome THEN
            -- User won
            IF v_trade.price_at_trade > 0 THEN
                v_payout := v_trade.amount * (100.0 / v_trade.price_at_trade);
            ELSE
                v_payout := v_trade.amount;
            END IF;
            
            -- Update trade
            UPDATE trades SET outcome = 'won', payout = v_payout WHERE id = v_trade.id;
            
            -- Credit wallet (create if missing)
            UPDATE wallets SET balance = balance + v_payout WHERE user_id = v_trade.user_id;
            IF NOT FOUND THEN
                INSERT INTO wallets (user_id, balance) VALUES (v_trade.user_id, 1000 + v_payout);
            END IF;

            -- Record transaction
            INSERT INTO transactions (user_id, type, amount, status, metadata)
            VALUES (v_trade.user_id, 'payout', v_payout, 'completed', json_build_object('market_id', p_market_id, 'trade_id', v_trade.id));
        ELSE
            -- User lost
            UPDATE trades SET outcome = 'lost', payout = 0 WHERE id = v_trade.id;
        END IF;
    END LOOP;

    RETURN json_build_object('success', true);
END;
$$ LANGUAGE plpgsql;
