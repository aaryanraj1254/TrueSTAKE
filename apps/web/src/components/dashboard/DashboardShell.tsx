import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Home, Trophy, User, WalletCards } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { DarkModeToggle } from '../DarkModeToggle';

const navItems = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/dashboard/portfolio', label: 'Portfolio', icon: WalletCards },
  { to: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export const DashboardShell: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/dashboard" className="inline-flex items-center gap-2 font-extrabold">
            <BarChart3 className="h-5 w-5" />
            TrueStake
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <NotificationBell />
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-6 md:grid-cols-[220px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <Outlet />
      </div>
    </div>
  );
};
