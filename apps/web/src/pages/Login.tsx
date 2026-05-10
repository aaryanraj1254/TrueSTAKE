import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoginSchema, type LoginCredentials } from '@truestake/shared';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { apiClient } from '../lib/axios';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [apiError, setApiError] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginCredentials>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setApiError('');
      const response = await apiClient.post('/auth/login', data);
      login(response.data);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'An error occurred during login.'
        : 'An error occurred during login.';
      setApiError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-emerald-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-emerald-900/50 bg-slate-900/90 p-8 shadow-xl shadow-emerald-950/30">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">TrueStake</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-50">Sign in to your account</h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {apiError && (
            <div className="rounded-lg border border-rose-600/40 bg-rose-950/40 p-3 text-sm text-rose-200">
              {apiError}
            </div>
          )}

          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-sm font-medium text-emerald-100">Email address</label>
              <input
                type="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border border-emerald-800 bg-slate-950 px-3 py-2 text-sm text-emerald-50 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-emerald-100">Password</label>
              <input
                type="password"
                {...register('password')}
                className="mt-1 block w-full rounded-md border border-emerald-800 bg-slate-950 px-3 py-2 text-sm text-emerald-50 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {errors.password && (
                <p className="mt-1 text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-emerald-200/80">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
