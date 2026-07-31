import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { register, login, getProfile, updateProfile } from '../controllers/authController';
import {
  runEnergyComparison,
  runBroadbandComparison,
  saveDeal,
  getSavedDeals,
  updateSavedDealStatus,
  getSmartMeterUsage
} from '../controllers/comparisonController';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'uswitchsecrettokenkey123!';

// Optional authentication middleware for guest comparisons
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
      req.user = decoded;
    } catch (error) {
      // Quietly ignore and proceed as guest comparison
    }
  }
  next();
}

// Auth Routes
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/profile', authMiddleware, getProfile);
router.put('/auth/profile', authMiddleware, updateProfile);

// Comparison Engine Routes
router.post('/comparisons/energy', optionalAuth, runEnergyComparison);
router.post('/comparisons/broadband', optionalAuth, runBroadbandComparison);

// Saved Deals & Switching Routes
router.post('/comparisons/save', authMiddleware, saveDeal);
router.get('/deals/saved', authMiddleware, getSavedDeals);
router.put('/deals/saved/:id', authMiddleware, updateSavedDealStatus);

// Smart Meter Utrack Route
router.get('/utrack/usage', authMiddleware, getSmartMeterUsage);

export default router;
