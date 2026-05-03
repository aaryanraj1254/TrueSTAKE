import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { CONSTANTS } from '@truestake/shared';
import { requestLogger } from './middlewares/requestLogger';
import { logger } from './services/logger';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.set('trust proxy', 1);
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    limit: Number(process.env.RATE_LIMIT_MAX || 300),
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  }),
);
app.use(express.json({ limit: '50kb' }));
app.use(mongoSanitize());
app.use(xss());
app.use(requestLogger);

// Auth Routes
import * as authController from './controllers/auth.controller';
import { authenticateToken, requireRole } from './middlewares/auth.middleware';

app.post('/auth/register', authController.register);
app.post('/auth/login', authController.login);
app.post('/auth/refresh', authController.refresh);
app.post('/auth/logout', authController.logout);

// Market Routes
import * as marketController from './controllers/market.controller';

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
import * as tradeController from './controllers/trade.controller';
app.post('/trades', authenticateToken, tradeController.placeTrade);
app.get('/trades/me', authenticateToken, tradeController.getMyTrades);
app.get('/trades/market/:id', tradeController.getMarketTrades);

// Wallet Routes
import * as walletController from './controllers/wallet.controller';
app.get('/wallet', authenticateToken, tradeController.getWallet);
app.get('/wallet/me', authenticateToken, walletController.getMyWallet);
app.post('/wallet/deposit', authenticateToken, walletController.deposit);
app.post('/wallet/withdraw', authenticateToken, walletController.withdraw);

// Dashboard Routes
import * as dashboardController from './controllers/dashboard.controller';
app.get('/dashboard/trending', authenticateToken, dashboardController.getTrendingMarkets);
app.get('/dashboard/portfolio', authenticateToken, dashboardController.getPortfolio);
app.get('/dashboard/leaderboard', authenticateToken, dashboardController.getLeaderboard);
app.get('/dashboard/profile', authenticateToken, dashboardController.getProfileStats);

// Admin Routes
import * as adminController from './controllers/admin.controller';
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

app.get('/', (req, res) => {
  res.json({ message: `Welcome to ${CONSTANTS.APP_NAME} API!` });
});

// Protected Route Example
app.get('/me', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user });
});

// Admin Route Example
app.get('/admin', authenticateToken, requireRole('admin'), (req, res) => {
  res.json({ success: true, message: 'Welcome Admin' });
});

app.listen(port, () => {
  logger.info(`[server]: Server is running at http://localhost:${port}`);
});
