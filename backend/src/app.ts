import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error-handler.middleware.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import strategiesRoutes from './modules/strategies/strategies.routes.js';
import marketDataRoutes from './modules/market-data/market-data.routes.js';
import backtestsRoutes from './modules/backtests/backtests.routes.js';
import simulationsRoutes from './modules/simulations/simulations.routes.js';
import paperRoutes from './modules/paper/paper.routes.js';

const app = express();

// ── Security ────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

// ── Rate limiting ───────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth/', authLimiter);

// ── Parsing ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ── Logging ─────────────────────────────────────────
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// ── Health check ────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// ── API Routes ──────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/strategies', strategiesRoutes);
app.use('/api', marketDataRoutes);
app.use('/api/backtests', backtestsRoutes);
app.use('/api/simulations', simulationsRoutes);
app.use('/api/paper', paperRoutes);

// ── 404 handler ─────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler (must be last) ─────────────
app.use(errorHandler);

export default app;
