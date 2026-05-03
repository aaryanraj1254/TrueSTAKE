import React, { useState } from 'react';
import axios from 'axios';
import { type AuthResponse } from '@truestake/shared';
import { AuthContext } from './auth-context';

const getStoredToken = () => localStorage.getItem('accessToken');

const getStoredUser = () => {
  const storedUser = localStorage.getItem('user');
  return storedUser ? (JSON.parse(storedUser) as AuthResponse['user']) : null;
};

const storedToken = getStoredToken();
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
}

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

    axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
  };

  const logout = async () => {
    try {
      // Call backend to invalidate session if needed
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/logout`);
    } catch (e) {
      console.error('Logout failed:', e);
    } finally {
      setAccessToken(null);
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
