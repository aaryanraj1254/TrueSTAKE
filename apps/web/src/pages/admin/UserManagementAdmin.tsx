import React from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchAdminUsers, setAdminUserBan } from '../../lib/api';

const money = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

export const UserManagementAdmin: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: users = [] } = useQuery({ queryKey: ['admin', 'users'], queryFn: fetchAdminUsers });

  const banMutation = useMutation({
    mutationFn: setAdminUserBan,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });

  return (
    <main className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">User management</h1>
        <p className="mt-1 text-muted-foreground">
          Review users, trading totals, roles, and account status.
        </p>
      </div>

      <section className="overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Trades</th>
              <th className="px-5 py-3">Total traded</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-5 py-4">
                  <p className="font-medium">{user.username || user.email || user.id}</p>
                  <p className="text-xs text-muted-foreground">{user.id}</p>
                </td>
                <td className="px-5 py-4">{user.role}</td>
                <td className="px-5 py-4">{user.tradeCount}</td>
                <td className="px-5 py-4">{money(user.totalTraded)}</td>
                <td className="px-5 py-4">{user.isBanned ? 'Banned' : 'Active'}</td>
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => banMutation.mutate({ userId: user.id, banned: !user.isBanned })}
                    className="rounded-lg border border-border px-3 py-2 font-semibold hover:bg-accent"
                  >
                    {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
};
