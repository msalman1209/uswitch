"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authController_1 = require("../controllers/authController");
const comparisonController_1 = require("../controllers/comparisonController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'uswitchsecrettokenkey123!';
// Optional authentication middleware for guest comparisons
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
            req.user = decoded;
        }
        catch (error) {
            // Quietly ignore and proceed as guest comparison
        }
    }
    next();
}
// Auth Routes
router.post('/auth/register', authController_1.register);
router.post('/auth/login', authController_1.login);
router.get('/auth/profile', auth_1.authMiddleware, authController_1.getProfile);
router.put('/auth/profile', auth_1.authMiddleware, authController_1.updateProfile);
// Comparison Engine Routes
router.post('/comparisons/energy', optionalAuth, comparisonController_1.runEnergyComparison);
router.post('/comparisons/broadband', optionalAuth, comparisonController_1.runBroadbandComparison);
router.post('/comparisons/sim', optionalAuth, comparisonController_1.runSimComparison);
router.post('/comparisons/mobile', optionalAuth, comparisonController_1.runMobileComparison);
// Saved Deals & Switching Routes
router.post('/comparisons/save', auth_1.authMiddleware, comparisonController_1.saveDeal);
router.get('/deals/saved', auth_1.authMiddleware, comparisonController_1.getSavedDeals);
router.put('/deals/saved/:id', auth_1.authMiddleware, comparisonController_1.updateSavedDealStatus);
// Smart Meter Utrack Route
router.get('/utrack/usage', auth_1.authMiddleware, comparisonController_1.getSmartMeterUsage);
exports.default = router;
