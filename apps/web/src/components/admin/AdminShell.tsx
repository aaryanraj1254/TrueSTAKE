import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { BarChart3, CheckCircle2, LineChart, PlusCircle, Shield, Users } from 'lucide-react';
import { DarkModeToggle } from '../DarkModeToggle';

const navItems = [
  { to: '/admin', label: 'Analytics', icon: BarChart3, end: true },
  { to: '/admin/create', label: 'Create Market', icon: PlusCircle },
  { to: '/admin/resolve', label: 'Resolve Market', icon: CheckCircle2 },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/transactions', label: 'Withdrawals', icon: LineChart },
];

export const AdminShell: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link to="/admin" className="inline-flex items-center gap-2 font-extrabold">
            <Shield className="h-5 w-5" />
            Admin
          </Link>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Link
              to="/dashboard"
              className="rounded-lg border border-border px-3 py-2 text-sm font-semibold hover:bg-accent"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[230px_1fr]">
        <nav className="flex gap-2 overflow-x-auto lg:flex-col">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
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
