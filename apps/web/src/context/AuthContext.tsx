import React, { useState } from 'react';
import { type AuthResponse } from '@truestake/shared';
import { AuthContext } from './auth-context';
import { apiClient } from '../lib/axios';

const getStoredToken = () => localStorage.getItem('accessToken');

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? (JSON.parse(storedUser) as AuthResponse['user']) : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthResponse['user'] | null>(() => getStoredUser());
  const [accessToken, setAccessToken] = useState<string | null>(() => getStoredToken());
  const isLoading = false;

  const login = (data: AuthResponse) => {
    setAccessToken(data.accessToken);
    setUser(data.user);

    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
