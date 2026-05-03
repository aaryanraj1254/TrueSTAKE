import { createContext } from 'react';
import { type AuthResponse } from '@truestake/shared';

export interface AuthContextType {
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
