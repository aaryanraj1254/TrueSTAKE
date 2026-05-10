import { supabase } from '../src/services/supabase';

async function setupRLSPolicies() {
  console.log('Setting up RLS policies...');

  try {
    // Enable RLS on all tables
    console.log('Enabling RLS on tables...');

    await supabase.rpc('sql', { query: 'ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('sql', { query: 'ALTER TABLE trades ENABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('sql', { query: 'ALTER TABLE markets ENABLE ROW LEVEL SECURITY;' });
    await supabase.rpc('sql', { query: 'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;' });

    console.log('RLS enabled on all tables');

    // Wallets policies - users can select/update own rows only
    console.log('Creating wallets policies...');

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
        CREATE POLICY "Users can view own wallet" ON wallets
          FOR SELECT USING (auth.uid() = user_id);
      `,
    });

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;
        CREATE POLICY "Users can update own wallet" ON wallets
          FOR UPDATE USING (auth.uid() = user_id);
      `,
    });

    // Trades policies - users can select/insert own rows only
    console.log('Creating trades policies...');

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can view own trades" ON trades;
        CREATE POLICY "Users can view own trades" ON trades
          FOR SELECT USING (auth.uid() = user_id);
      `,
    });

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can insert own trades" ON trades;
        CREATE POLICY "Users can insert own trades" ON trades
          FOR INSERT WITH CHECK (auth.uid() = user_id);
      `,
    });

    // Markets policies - public select, admin insert/update
    console.log('Creating markets policies...');

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Public can view markets" ON markets;
        CREATE POLICY "Public can view markets" ON markets
          FOR SELECT USING (true);
      `,
    });

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Admin can insert markets" ON markets;
        CREATE POLICY "Admin can insert markets" ON markets
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM auth.users 
              WHERE auth.users.id = auth.uid() 
              AND auth.users.raw_user_meta_data->>'role' = 'admin'
            )
          );
      `,
    });

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Admin can update markets" ON markets;
        CREATE POLICY "Admin can update markets" ON markets
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM auth.users 
              WHERE auth.users.id = auth.uid() 
              AND auth.users.raw_user_meta_data->>'role' = 'admin'
            )
          );
      `,
    });

    // Transactions policies - users can select own rows only
    console.log('Creating transactions policies...');

    await supabase.rpc('sql', {
      query: `
        DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
        CREATE POLICY "Users can view own transactions" ON transactions
          FOR SELECT USING (auth.uid() = user_id);
      `,
    });

    console.log('✅ RLS policies setup completed successfully!');
  } catch (error) {
    console.error('❌ Error setting up RLS policies:', error);
    process.exit(1);
  }
}

setupRLSPolicies();
