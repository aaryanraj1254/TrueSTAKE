import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { CONSTANTS } from '@truestake/shared';
import * as adminController from './controllers/admin.controller';
import * as authController from './controllers/auth.controller';
import * as dashboardController from './controllers/dashboard.controller';
import * as marketController from './controllers/market.controller';
import * as tradeController from './controllers/trade.controller';
import * as walletController from './controllers/wallet.controller';
import { authenticateToken, requireRole } from './middlewares/auth.middleware';
import { authRateLimiter, globalRateLimiter } from './middleware/rateLimiter';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { supabase } from './services/supabase';

dotenv.config();

const app = express();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: frontendUrl,
    credentials: true,
  }),
);
app.use(globalRateLimiter);
app.use(express.json({ limit: '50kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(requestLogger);

// Health Check Route
app.get('/health', async (req, res) => {
  try {
    console.log('Testing Supabase connection...');
    const { error } = await supabase.from('wallets').select('id').limit(1);

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({
        status: 'error',
        db: 'disconnected',
        error: error.message,
      });
    }

    console.log('Supabase connection successful');
    res.json({
      status: 'ok',
      db: 'connected',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      db: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use('/auth', authRateLimiter);

// Auth Routes
app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/logout', authController.logout);

// Market Routes
app.get('/markets', marketController.getMarkets);
app.get('/markets/:id', marketController.getMarketById);
app.post('/markets', authenticateToken, requireRole('admin'), marketController.createMarket);
app.patch(
  '/markets/:id/resolve',
  authenticateToken,
  requireRole('admin'),
  marketController.resolveMarket,
);

// Trade Routes
app.post('/trades', authenticateToken, tradeController.placeTrade);
app.get('/trades/me', authenticateToken, tradeController.getMyTrades);
app.get('/trades/market/:id', tradeController.getMarketTrades);

// Wallet Routes
app.get('/wallet', authenticateToken, tradeController.getWallet);
app.get('/wallet/me', authenticateToken, walletController.getMyWallet);
app.post('/wallet/deposit', authenticateToken, walletController.deposit);
app.post('/wallet/withdraw', authenticateToken, walletController.withdraw);

// Dashboard Routes
app.get('/dashboard/trending', authenticateToken, dashboardController.getTrendingMarkets);
app.get('/dashboard/portfolio', authenticateToken, dashboardController.getPortfolio);
app.get('/dashboard/leaderboard', authenticateToken, dashboardController.getLeaderboard);
app.get('/dashboard/profile', authenticateToken, dashboardController.getProfileStats);

// Admin Routes
app.get('/admin/markets', authenticateToken, requireRole('admin'), marketController.getMarkets);
app.post('/admin/markets', authenticateToken, requireRole('admin'), marketController.createMarket);
app.patch(
  '/admin/markets/:id/resolve',
  authenticateToken,
  requireRole('admin'),
  marketController.resolveMarket,
);
app.get('/admin/users', authenticateToken, requireRole('admin'), adminController.listUsers);
app.post('/admin/users/:id/ban', authenticateToken, requireRole('admin'), adminController.banUser);
app.post(
  '/admin/users/:id/unban',
  authenticateToken,
  requireRole('admin'),
  adminController.unbanUser,
);
app.get(
  '/admin/withdrawals',
  authenticateToken,
  requireRole('admin'),
  adminController.listWithdrawals,
);
app.post(
  '/admin/withdrawals/:id/approve',
  authenticateToken,
  requireRole('admin'),
  adminController.approveWithdrawal,
);
app.post(
  '/admin/withdrawals/:id/reject',
  authenticateToken,
  requireRole('admin'),
  adminController.rejectWithdrawal,
);
app.get('/admin/analytics', authenticateToken, requireRole('admin'), adminController.getAnalytics);

app.get('/', (_req, res) => {
  res.json({ message: `Welcome to ${CONSTANTS.APP_NAME} API!` });
});

app.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

app.get('/admin', authenticateToken, requireRole('admin'), (_req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});

app.use(errorHandler);

export { app };
