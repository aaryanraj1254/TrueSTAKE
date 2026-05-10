import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RegisterSchema, type AuthResponse, type RegisterCredentials } from '@truestake/shared';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../lib/axios';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterCredentials>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterCredentials) => {
    try {
      setApiError('');
      const response = await apiClient.post<AuthResponse>('/auth/register', data);

      if (response.data?.accessToken && response.data?.user) {
        login(response.data);
        navigate('/dashboard', { replace: true });
        return;
      }

      navigate('/login', { state: { message: 'Registration successful. Please login.' } });
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.error || 'An error occurred during registration.'
        : 'An error occurred during registration.';
      setApiError(message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-emerald-50">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-emerald-900/50 bg-slate-900/90 p-8 shadow-xl shadow-emerald-950/30">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">TrueStake</p>
          <h2 className="mt-2 text-2xl font-bold text-emerald-50">Create a new account</h2>
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
              <label className="block text-sm font-medium text-emerald-100">Username</label>
              <input
                type="text"
                {...register('username')}
                className="mt-1 block w-full rounded-md border border-emerald-800 bg-slate-950 px-3 py-2 text-sm text-emerald-50 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400"
              />
              {errors.username && (
                <p className="mt-1 text-xs text-destructive">{errors.username.message}</p>
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
              {isSubmitting ? 'Creating account...' : 'Register'}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-emerald-200/80">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
