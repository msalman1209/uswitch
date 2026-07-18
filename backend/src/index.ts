import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './models';
import apiRouter from './routes/api';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with default settings (allow requests from frontend dev server)
app.use(cors({
  origin: '*', // In production, replace with specific domain
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start DB & Express Server
async function startServer() {
  await initDB();
  
  app.listen(PORT, () => {
    console.log(`[Uswitch API] Server is running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server failed to start:', err);
});
