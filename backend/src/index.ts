import dotenv from 'dotenv';
// Load environment variables first
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { initDB } from './models';
import apiRouter from './routes/api';

const app = express();
const PORT: number = Number(process.env.PORT) || 5000;

// Enable CORS with default settings
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle JSON parse errors gracefully
app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400) {
    return res.status(400).json({ error: 'Invalid JSON payload format' });
  }
  next(err);
});

// Mount all unified API routes under /api
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Global 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start DB & Express Server
async function startServer() {
  app.listen(PORT, () => {
    console.log(`[NexGen Power API] Server is running on port ${PORT}`);
  });

  initDB().catch((err: any) => {
    console.warn('[NexGen Power API] DB init notice:', err.message);
  });
}

// Only start standalone server on a port if NOT in Serverless (Vercel / Lambda)
if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer().catch((err: unknown) => {
    console.error('[NexGen Power API] Server failed to start:', err);
  });
} else {
  // In serverless environment, initialize database non-blocking
  initDB().catch((err: any) => {
    console.warn('[NexGen Power API] Serverless DB init notice:', err.message);
  });
}

export default app;
