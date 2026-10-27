import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import pricingRouter from './routes/pricing.js';
import forecastingRouter from './routes/forecasting.js';
import suppliersRouter from './routes/suppliers.js';
import dashboardRouter from './routes/dashboard.js';
import auditRouter from './routes/audit.js';
import path from 'path';
import fs from 'fs';
import { db } from './db/index.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/dashboard', dashboardRouter);
app.use('/api/products', productsRouter);
app.use('/api/pricing', pricingRouter);
app.use('/api/forecasting', forecastingRouter);
app.use('/api/suppliers', suppliersRouter);
app.use('/api/audit', auditRouter);

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    postgres_connected: db.isUsingPostgres(),
    gemini_key_detected: Boolean(process.env.GEMINI_API_KEY)
  });
});

// Serve static files in production or when client/dist exists
const clientDistPath = path.resolve(process.cwd(), '../client/dist');
const altClientDistPath = path.resolve(process.cwd(), 'client/dist');
const finalDistPath = fs.existsSync(clientDistPath) ? clientDistPath : fs.existsSync(altClientDistPath) ? altClientDistPath : null;

if (finalDistPath) {
  console.log(`[SERVER] Serving compiled frontend from ${finalDistPath}`);
  app.use(express.static(finalDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(finalDistPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`  RetailPulse AI - Express Backend Server Running    `);
  console.log(`  Port: http://localhost:${PORT}                      `);
  console.log(`  Database: ${db.isUsingPostgres() ? 'PostgreSQL (Replit/Cloud)' : 'Local Persistent Storage'}`);
  console.log(`  Gemini AI: ${process.env.GEMINI_API_KEY ? 'Active (@google/genai)' : 'Intelligent Deterministic Engine (API Key unconfigured)'}`);
  console.log(`======================================================\n`);
});
