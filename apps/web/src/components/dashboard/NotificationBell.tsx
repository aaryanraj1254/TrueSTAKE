import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { browserSupabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    const client = browserSupabase;

    if (!client || !user?.id) {
      return undefined;
    }

    const channel = client
      .channel(`wallet-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        () => setCount((value) => value + 1),
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user?.id]);

  return (
    <button
      type="button"
      onClick={() => setCount(0)}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-accent"
      title={
        browserSupabase
          ? 'Notifications'
          : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY for realtime notifications'
      }
    >
      <Bell className="h-4 w-4" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
          {count}
        </span>
      )}
    </button>
  );
};
