import { Request, Response } from 'express';
import { supabase } from '../services/supabase';
import { LoginSchema, RegisterSchema } from '@truestake/shared';

export const register = async (req: Request, res: Response) => {
  const result = RegisterSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  const { email, password, username } = result.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
        role: 'user', // default role
      },
    },
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(201).json({ message: 'Registration successful', user: data.user });
};

export const login = async (req: Request, res: Response) => {
  const result = LoginSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ error: 'Invalid input', details: result.error.format() });
  }

  const { email, password } = result.data;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  // Format the response according to AuthResponse interface
  const authResponse = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user.id,
      email: data.user.email,
      username: data.user.user_metadata?.username,
      role: data.user.user_metadata?.role || 'user',
    },
  };

  return res.status(200).json(authResponse);
};

export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token is required' });
  }

  const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  if (!data.session) {
    return res.status(401).json({ error: 'Could not refresh session' });
  }

  const authResponse = {
    accessToken: data.session.access_token,
    refreshToken: data.session.refresh_token,
    user: {
      id: data.user!.id,
      email: data.user!.email,
      username: data.user!.user_metadata?.username,
      role: data.user!.user_metadata?.role || 'user',
    },
  };

  return res.status(200).json(authResponse);
};

export const logout = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(400).json({ error: 'Missing authorization header' });
  }

  const token = authHeader.split(' ')[1];

  // We don't have the refresh token necessarily, but we can sign out the user if we call supabase.auth.admin.signOut
  // Or we can just let the frontend discard the token. Supabase auth signs out the *current session* if we do it contextually.
  // Since our backend is stateless regarding the JWT, logging out a specific user requires their JWT.
  const { error } = await supabase.auth.admin.signOut(token);

  if (error) {
    console.error('Logout error (might be expected if token invalid):', error.message);
  }

  return res.status(200).json({ message: 'Logged out successfully' });
};
