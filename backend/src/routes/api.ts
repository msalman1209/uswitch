import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Comparison, SavedDeal, SmartMeter } from '../models';
import { jellyfishService } from '../services/jellyfishService';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'uswitchsecrettokenkey123!';

// Extended Request interface for authenticated user info
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    [key: string]: any;
  };
}

// ==================== AUTHENTICATION MIDDLEWARES ====================

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authorization token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
      req.user = decoded;
    } catch {
      // Quietly continue as guest
    }
  }
  next();
}

// Seed dummy smart meter data for new users
async function seedSmartMeterDataForUser(userId: number) {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    const elecUsage = 6 + Math.random() * 5;
    const gasUsage = 15 + Math.random() * 20;
    const elecCost = elecUsage * 0.24 + 0.50;
    const gasCost = gasUsage * 0.06 + 0.30;

    data.push({
      userId,
      recordDate: dateString,
      electricityUsageKwh: parseFloat(elecUsage.toFixed(2)),
      gasUsageKwh: parseFloat(gasUsage.toFixed(2)),
      electricityCost: parseFloat(elecCost.toFixed(2)),
      gasCost: parseFloat(gasCost.toFixed(2))
    });
  }
  await SmartMeter.bulkCreate(data);
}

// ==================== 1. AUTHENTICATION ROUTES & FUNCTIONS ====================

export async function register(req: Request, res: Response) {
  const { email, password, firstName, lastName, postcode, phone } = req.body;
  try {
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      firstName,
      lastName,
      postcode,
      phone
    });

    await seedSmartMeterDataForUser(user.id);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        postcode: user.postcode,
        phone: user.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
}
router.post('/auth/register', register);

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h'
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        postcode: user.postcode,
        phone: user.phone
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
}
router.post('/auth/login', login);

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      postcode: user.postcode,
      phone: user.phone
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
}
router.get('/auth/profile', authMiddleware, getProfile);

export async function updateProfile(req: AuthRequest, res: Response) {
  const { firstName, lastName, postcode, phone } = req.body;
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (postcode) user.postcode = postcode;
    if (phone) user.phone = phone;

    await user.save();

    return res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      postcode: user.postcode,
      phone: user.phone
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
}
router.put('/auth/profile', authMiddleware, updateProfile);


// ==================== 2. COMPARISON ENGINES ROUTES & FUNCTIONS ====================

const MOCK_ENERGY_DEALS = [
  {
    supplierName: 'Fuse Energy',
    planName: 'Fixed July 2026 (15m) V7',
    elecUnitRate: 0.205,
    elecStandingCharge: 0.45,
    gasUnitRate: 0.051,
    gasStandingCharge: 0.28,
    exitFee: 50.00,
    isGreen: true,
    rating: 4.8
  },
  {
    supplierName: 'Octopus Energy',
    planName: 'Octopus Fixed 12M',
    elecUnitRate: 0.212,
    elecStandingCharge: 0.48,
    gasUnitRate: 0.053,
    gasStandingCharge: 0.29,
    exitFee: 75.00,
    isGreen: true,
    rating: 4.7
  },
  {
    supplierName: 'E.ON Next',
    planName: 'Next Fixed 1 Year',
    elecUnitRate: 0.218,
    elecStandingCharge: 0.51,
    gasUnitRate: 0.055,
    gasStandingCharge: 0.31,
    exitFee: 100.00,
    isGreen: true,
    rating: 4.2
  },
  {
    supplierName: 'British Gas',
    planName: 'Price Promise Fixed v12',
    elecUnitRate: 0.222,
    elecStandingCharge: 0.53,
    gasUnitRate: 0.056,
    gasStandingCharge: 0.32,
    exitFee: 150.00,
    isGreen: false,
    rating: 4.0
  },
  {
    supplierName: 'EDF Energy',
    planName: 'EDF Essentials Fixed 1Yr',
    elecUnitRate: 0.225,
    elecStandingCharge: 0.52,
    gasUnitRate: 0.058,
    gasStandingCharge: 0.30,
    exitFee: 75.00,
    isGreen: true,
    rating: 4.1
  }
];

const MOCK_BUSINESS_ENERGY_DEALS = [
  {
    supplierName: 'British Gas Business',
    planName: 'Business Fixed 12M Protect',
    elecUnitRate: 0.224,
    elecStandingCharge: 0.65,
    gasUnitRate: 0.054,
    gasStandingCharge: 0.40,
    contractLength: 12,
    exitFee: 0,
    isGreen: false,
    rating: 4.6,
    features: ['Fixed rate price lock', 'Dedicated business account manager', 'Free smart meter installation']
  },
  {
    supplierName: 'Octopus Energy for Business',
    planName: 'Business 24M Green Fixed',
    elecUnitRate: 0.218,
    elecStandingCharge: 0.58,
    gasUnitRate: 0.052,
    gasStandingCharge: 0.38,
    contractLength: 24,
    exitFee: 0,
    isGreen: true,
    rating: 4.9,
    features: ['100% Renewable electricity (REGO)', 'No exit fees for small business', 'Carbon neutral gas option']
  },
  {
    supplierName: 'TotalEnergies Gas & Power',
    planName: 'Pure Commercial 12M Saver',
    elecUnitRate: 0.215,
    elecStandingCharge: 0.60,
    gasUnitRate: 0.049,
    gasStandingCharge: 0.35,
    contractLength: 12,
    exitFee: 0,
    isGreen: true,
    rating: 4.7,
    features: ['Lowest unit rates for SMEs', 'Automated bill management', 'Climate Change Levy (CCL) compliant']
  },
  {
    supplierName: 'EDF Energy Business',
    planName: 'Commercial Freedom Fixed 36M',
    elecUnitRate: 0.210,
    elecStandingCharge: 0.62,
    gasUnitRate: 0.050,
    gasStandingCharge: 0.36,
    contractLength: 36,
    exitFee: 0,
    isGreen: false,
    rating: 4.5,
    features: ['3-Year inflation protection', 'Zero peak-demand penalty', 'Ideal for long-term lease premises']
  },
  {
    supplierName: 'E.ON Next Business',
    planName: 'Next Business 1 Year Fixed',
    elecUnitRate: 0.221,
    elecStandingCharge: 0.60,
    gasUnitRate: 0.053,
    gasStandingCharge: 0.39,
    contractLength: 12,
    exitFee: 0,
    isGreen: true,
    rating: 4.6,
    features: ['100% Renewable backed by UK wind', 'Online customer dashboard', 'Direct Debit automated discount']
  },
  {
    supplierName: 'SmartestEnergy Business',
    planName: 'Commercial Eco Smart Fixed',
    elecUnitRate: 0.219,
    elecStandingCharge: 0.55,
    gasUnitRate: 0.051,
    gasStandingCharge: 0.37,
    contractLength: 12,
    exitFee: 0,
    isGreen: true,
    rating: 4.7,
    features: ['Certified British renewable sources', 'Eco certificate for marketing', 'Transparent pass-through billing']
  },
  {
    supplierName: 'Corona Energy',
    planName: 'SME Commercial Rate Guard 24M',
    elecUnitRate: 0.220,
    elecStandingCharge: 0.59,
    gasUnitRate: 0.052,
    gasStandingCharge: 0.39,
    contractLength: 24,
    exitFee: 0,
    isGreen: false,
    rating: 4.4,
    features: ['Fixed unit rates for 2 full years', 'Tailored for hospitality and retail', 'Simple single bill for multi-site']
  }
];

const MOCK_BROADBAND_DEALS = [
  {
    providerName: 'Virgin Media',
    planName: 'Bigger Combo Gig1 Fibre',
    speedMbps: 1130,
    costMonthly: 39.00,
    setupCost: 0.00,
    contractLength: 18,
    features: ['Fibre broadband', 'Virgin TV 360 Box', 'Unlimited downloads', 'No activation fee'],
    type: 'fibre'
  },
  {
    providerName: 'Sky Broadband',
    planName: 'Superfast 80 + Sky Stream TV',
    speedMbps: 61,
    costMonthly: 26.00,
    setupCost: 19.95,
    contractLength: 18,
    features: ['Superfast fibre', 'Sky Stream Hub', 'Free standard delivery'],
    type: 'tv-bundle'
  },
  {
    providerName: 'BT Broadband',
    planName: 'Full Fibre 500',
    speedMbps: 500,
    costMonthly: 34.99,
    setupCost: 29.99,
    contractLength: 24,
    features: ['Guaranteed speed', 'Smart Hub 2 included', 'Complete Wi-Fi optional'],
    type: 'fibre'
  },
  {
    providerName: 'TalkTalk',
    planName: 'Fibre 65',
    speedMbps: 67,
    costMonthly: 28.00,
    setupCost: 0.00,
    contractLength: 24,
    features: ['Cheapest standard fibre', 'Fixed price lock', 'Award winning router'],
    type: 'fibre'
  },
  {
    providerName: 'Vodafone',
    planName: 'Pro II Full Fibre 900',
    speedMbps: 910,
    costMonthly: 44.00,
    setupCost: 9.99,
    contractLength: 24,
    features: ['Ultrafast speed', 'Super WiFi booster', '4G backup router included'],
    type: 'fibre'
  }
];

const MOCK_SIM_DEALS = [
  {
    providerName: 'EE Mobile',
    planName: 'Essentials 100GB 5G',
    dataGb: 100,
    costMonthly: 12.00,
    contractLength: 12,
    features: ['Fastest 5G speeds', 'EU Roaming include', 'Unlimited calls & texts'],
    rating: 4.6
  },
  {
    providerName: 'O2 Mobile',
    planName: 'Unlimited Plus 5G',
    dataGb: -1,
    costMonthly: 22.00,
    contractLength: 24,
    features: ['O2 Priority rewards', 'Unlimited data', 'Roam in 75 destinations'],
    rating: 4.4
  },
  {
    providerName: 'Vodafone',
    planName: 'Red 50GB 5G',
    dataGb: 50,
    costMonthly: 10.00,
    contractLength: 12,
    features: ['VeryMe Rewards access', '99% UK coverage', 'Unlimited texts'],
    rating: 4.2
  },
  {
    providerName: 'Three Mobile',
    planName: 'Three Lite Unlimited 5G',
    dataGb: -1,
    costMonthly: 15.00,
    contractLength: 12,
    features: ['Cheapest unlimited data', '5G at no extra cost', 'Go Roam around the world'],
    rating: 4.5
  },
  {
    providerName: 'Smarty',
    planName: '100GB Rolling Sim',
    dataGb: 100,
    costMonthly: 10.00,
    contractLength: 1,
    features: ['Powered by Three network', 'No contract', 'EU Roaming included'],
    rating: 4.7
  }
];

const MOCK_MOBILE_DEALS = [
  {
    handsetName: 'iPhone 15 Pro',
    providerName: 'EE Mobile',
    planName: 'Unlimited Max 5G',
    costMonthly: 45.00,
    upfrontCost: 49.00,
    contractLength: 24,
    features: ['Free Apple Music 6 months', 'Unlimited 5G data', 'Lifetime handset warranty'],
    dataGb: -1
  },
  {
    handsetName: 'iPhone 15 Pro',
    providerName: 'Vodafone',
    planName: 'Red Unlimited 5G',
    costMonthly: 41.00,
    upfrontCost: 29.00,
    contractLength: 24,
    features: ['Secure Net protection', 'Unlimited data', 'Upgrade after 12 months'],
    dataGb: -1
  },
  {
    handsetName: 'Samsung Galaxy S24',
    providerName: 'O2 Mobile',
    planName: '100GB Special Promo',
    costMonthly: 38.00,
    upfrontCost: 19.00,
    contractLength: 24,
    features: ['O2 Priority tickets', '100GB 5G data', 'Disney+ free for 6 months'],
    dataGb: 100
  },
  {
    handsetName: 'Samsung Galaxy S24',
    providerName: 'Three Mobile',
    planName: 'Three Unlimited Handset',
    costMonthly: 35.00,
    upfrontCost: 0.00,
    contractLength: 24,
    features: ['Zero upfront cost', 'Unlimited 5G data', 'Free Galaxy Buds FE'],
    dataGb: -1
  },
  {
    handsetName: 'Google Pixel 8',
    providerName: 'Vodafone',
    planName: '50GB Value Plan',
    costMonthly: 29.00,
    upfrontCost: 0.00,
    contractLength: 24,
    features: ['Best price guarantee', '50GB 5G data', 'Google One membership free'],
    dataGb: 50
  }
];

export async function runEnergyComparison(req: AuthRequest, res: Response) {
  const {
    postcode,
    currentSupplier,
    currentPlanName,
    paymentMethod,
    usageType,
    propertySize,
    annualElecKwh,
    annualGasKwh,
    fuelType = 'both',
    customerType = 'residential',
    isBusiness = false,
    businessName,
    businessType,
    companyNumber,
    vatNumber,
    sector,
    contractEndDate
  } = req.body;

  try {
    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required' });
    }

    const isCommercial = isBusiness === true || customerType === 'business';

    let elecUsage = isCommercial ? 30000 : 2900;
    let gasUsage = isCommercial ? 75000 : 11500;

    if (usageType === 'exact') {
      if (annualElecKwh) elecUsage = parseFloat(annualElecKwh);
      if (annualGasKwh) gasUsage = parseFloat(annualGasKwh);
    } else {
      if (isCommercial) {
        if (propertySize === 'small' || propertySize === 'micro') {
          elecUsage = 10000;
          gasUsage = 25000;
        } else if (propertySize === 'large') {
          elecUsage = 85000;
          gasUsage = 200000;
        }
      } else {
        if (propertySize === 'small') {
          elecUsage = 1800;
          gasUsage = 6000;
        } else if (propertySize === 'large') {
          elecUsage = 4300;
          gasUsage = 17000;
        }
      }
    }

    const currentElecUnit = isCommercial ? 0.285 : 0.245;
    const currentElecStanding = isCommercial ? 0.85 : 0.60;
    const currentGasUnit = isCommercial ? 0.075 : 0.062;
    const currentGasStanding = isCommercial ? 0.55 : 0.31;

    let currentElecAnnual = 0;
    let currentGasAnnual = 0;

    if (fuelType === 'both' || fuelType === 'electricity') {
      currentElecAnnual = (elecUsage * currentElecUnit) + (currentElecStanding * 365);
    }
    if (fuelType === 'both' || fuelType === 'gas') {
      currentGasAnnual = (gasUsage * currentGasUnit) + (currentGasStanding * 365);
    }

    const currentAnnualCost = currentElecAnnual + currentGasAnnual;
    const currentMonthlyCost = currentAnnualCost / 12;

    const dealsPool = isCommercial ? MOCK_BUSINESS_ENERGY_DEALS : MOCK_ENERGY_DEALS;

    const deals = dealsPool.map((deal, idx) => {
      let dealElecAnnual = 0;
      let dealGasAnnual = 0;

      if (fuelType === 'both' || fuelType === 'electricity') {
        dealElecAnnual = (elecUsage * deal.elecUnitRate) + (deal.elecStandingCharge * 365);
      }
      if (fuelType === 'both' || fuelType === 'gas') {
        dealGasAnnual = (gasUsage * deal.gasUnitRate) + (deal.gasStandingCharge * 365);
      }

      const dealAnnualCost = dealElecAnnual + dealGasAnnual;
      const dealMonthlyCost = dealAnnualCost / 12;
      const annualSaving = currentAnnualCost - dealAnnualCost;

      return {
        id: `deal-${idx + 1}`,
        supplierName: deal.supplierName,
        planName: deal.planName,
        costMonthly: parseFloat(dealMonthlyCost.toFixed(2)),
        costAnnual: parseFloat(dealAnnualCost.toFixed(2)),
        savingAnnual: parseFloat((annualSaving > 0 ? annualSaving : (isCommercial ? 480 : 150)).toFixed(2)),
        exitFee: deal.exitFee,
        isGreen: deal.isGreen,
        rating: deal.rating,
        contractLength: (deal as any).contractLength || 12,
        features: (deal as any).features || [],
        isBusiness: isCommercial
      };
    }).sort((a, b) => b.savingAnnual - a.savingAnnual);

    const inputData = {
      postcode,
      currentSupplier,
      currentPlanName,
      paymentMethod,
      usageType,
      propertySize,
      fuelType,
      elecUsage,
      gasUsage
    };

    const results = {
      currentPlan: {
        costMonthly: parseFloat(currentMonthlyCost.toFixed(2)),
        costAnnual: parseFloat(currentAnnualCost.toFixed(2))
      },
      deals
    };

    const comparison = await Comparison.create({
      userId: req.user ? req.user.id : null,
      type: 'energy',
      inputData,
      results
    });

    return res.json({
      comparisonId: comparison.id,
      inputData,
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}
router.post('/comparisons/energy', optionalAuth, runEnergyComparison);

export async function runBroadbandComparison(req: AuthRequest, res: Response) {
  const { postcode, currentProvider, contractStatus } = req.body;
  try {
    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required' });
    }

    const deals = MOCK_BROADBAND_DEALS;
    const inputData = { postcode, currentProvider, contractStatus };
    const results = { deals };

    const comparison = await Comparison.create({
      userId: req.user ? req.user.id : null,
      type: 'broadband',
      inputData,
      results
    });

    return res.json({
      comparisonId: comparison.id,
      inputData,
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}
router.post('/comparisons/broadband', optionalAuth, runBroadbandComparison);

export async function runSimComparison(req: AuthRequest, res: Response) {
  const { postcode, currentProvider, contractStatus } = req.body;
  try {
    const deals = MOCK_SIM_DEALS;
    const inputData = { postcode, currentProvider, contractStatus };
    const results = { deals };

    const comparison = await Comparison.create({
      userId: req.user ? req.user.id : null,
      type: 'sim',
      inputData,
      results
    });

    return res.json({
      comparisonId: comparison.id,
      inputData,
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}
router.post('/comparisons/sim', optionalAuth, runSimComparison);

export async function runMobileComparison(req: AuthRequest, res: Response) {
  const { postcode, handsetName, networkProvider } = req.body;
  try {
    let deals = MOCK_MOBILE_DEALS;
    if (handsetName) {
      deals = MOCK_MOBILE_DEALS.filter(d => d.handsetName.toLowerCase().includes(handsetName.toLowerCase()));
    }
    if (networkProvider) {
      deals = deals.filter(d => d.providerName.toLowerCase().includes(networkProvider.toLowerCase()));
    }

    const inputData = { postcode, handsetName, networkProvider };
    const results = { deals };

    const comparison = await Comparison.create({
      userId: req.user ? req.user.id : null,
      type: 'mobile',
      inputData,
      results
    });

    return res.json({
      comparisonId: comparison.id,
      inputData,
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Comparison failed' });
  }
}
router.post('/comparisons/mobile', optionalAuth, runMobileComparison);


// ==================== 3. SAVED DEALS & SWITCHING ROUTES & FUNCTIONS ====================

export async function saveDeal(req: AuthRequest, res: Response) {
  const { comparisonId, category, supplierName, planName, costMonthly, costAnnual, savingAnnual } = req.body;
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const comparison = await Comparison.findByPk(comparisonId);
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison search record not found' });
    }

    const savedDeal = await SavedDeal.create({
      userId: req.user.id,
      comparisonId,
      category,
      supplierName,
      planName,
      costMonthly,
      costAnnual,
      savingAnnual,
      status: 'switching'
    });

    return res.status(201).json(savedDeal);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to save deal' });
  }
}
router.post('/comparisons/save', authMiddleware, saveDeal);

export async function getSavedDeals(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const savedDeals = await SavedDeal.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    return res.json(savedDeals);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch saved deals' });
  }
}
router.get('/deals/saved', authMiddleware, getSavedDeals);

export async function updateSavedDealStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body;
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const savedDeal = await SavedDeal.findOne({
      where: { id, userId: req.user.id }
    });

    if (!savedDeal) {
      return res.status(404).json({ error: 'Saved deal not found' });
    }

    if (status) {
      savedDeal.status = status;
      await savedDeal.save();
    }

    return res.json(savedDeal);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update switching status' });
  }
}
router.put('/deals/saved/:id', authMiddleware, updateSavedDealStatus);


// ==================== 4. SMART METER UTRACK ROUTES & FUNCTIONS ====================

export async function getSmartMeterUsage(req: AuthRequest, res: Response) {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const usage = await SmartMeter.findAll({
      where: { userId: req.user.id },
      order: [['recordDate', 'ASC']]
    });

    return res.json(usage);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch Utrack records' });
  }
}
router.get('/utrack/usage', authMiddleware, getSmartMeterUsage);


// ==================== 5. JELLYFISH ENERGY SEARCH & SWITCHING ENGINE ====================

export async function createJellyfishSearch(req: AuthRequest, res: Response) {
  const {
    postcode,
    address,
    fuelType = 'both',
    currentSupplier,
    paymentMethod = 'monthly-direct-debit',
    usageType = 'estimate',
    propertySize = 'medium',
    annualElecKwh,
    annualGasKwh,
    customerType = 'residential',
    isBusiness = false,
    businessName,
    businessType,
    companyNumber,
    vatNumber,
    sector,
    contractEndDate,
    meterType
  } = req.body;

  try {
    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required' });
    }

    const isCommercial = isBusiness === true || customerType === 'business';

    let elecUsage = isCommercial ? 30000 : 2900;
    let gasUsage = isCommercial ? 75000 : 11500;

    if (usageType === 'exact') {
      if (annualElecKwh) elecUsage = parseFloat(annualElecKwh);
      if (annualGasKwh) gasUsage = parseFloat(annualGasKwh);
    } else {
      if (isCommercial) {
        if (propertySize === 'small' || propertySize === 'micro') {
          elecUsage = 10000;
          gasUsage = 25000;
        } else if (propertySize === 'large') {
          elecUsage = 85000;
          gasUsage = 200000;
        }
      } else {
        if (propertySize === 'small') {
          elecUsage = 1800;
          gasUsage = 6000;
        } else if (propertySize === 'large') {
          elecUsage = 4300;
          gasUsage = 17000;
        }
      }
    }

    const capElecUnit = isCommercial ? 0.285 : 0.245;
    const capElecStanding = isCommercial ? 0.85 : 0.60;
    const capGasUnit = isCommercial ? 0.075 : 0.062;
    const capGasStanding = isCommercial ? 0.55 : 0.31;

    let currentElecAnnual = 0;
    let currentGasAnnual = 0;

    if (fuelType === 'both' || fuelType === 'electricity') {
      currentElecAnnual = (elecUsage * capElecUnit) + (capElecStanding * 365);
    }
    if (fuelType === 'both' || fuelType === 'gas') {
      currentGasAnnual = (gasUsage * capGasUnit) + (capGasStanding * 365);
    }

    const currentAnnualCost = currentElecAnnual + currentGasAnnual;
    const currentMonthlyCost = currentAnnualCost / 12;

    let searchId: string | number | null = null;
    let deals: any[] = [];
    let isLiveJellyfish = false;

    // Search via Jellyfish Energy Medusa API (for domestic residential supply)
    if (process.env.JELLYFISH_BASE_URL && !isCommercial) {
      try {
        console.log(`[NexGen API] Initiating live Jellyfish Medusa Search for postcode=${postcode}, fuelType=${fuelType}`);
        const searchResp = await jellyfishService.createSearch({
          postcode,
          address,
          fuelType,
          currentSupplier,
          paymentMethod,
          propertySize,
          annualElecKwh: elecUsage,
          annualGasKwh: gasUsage
        });

        searchId = searchResp.id || searchResp.searchId || searchResp._id || null;

        if (searchId) {
          const resultsResp = await jellyfishService.getSearchResults(searchId);
          const rawDeals = Array.isArray(resultsResp)
            ? resultsResp
            : ((resultsResp as any)?.products || (resultsResp as any)?.deals || (resultsResp as any)?.tariffs || []);

          if (rawDeals && rawDeals.length > 0) {
            isLiveJellyfish = true;
            deals = rawDeals.map((item: any, idx: number) => {
              const annual = item.costs?.annualCost || item.costAnnual || item.annualCost || item.annualSpend || (item.costMonthly ? item.costMonthly * 12 : 1200);
              const monthly = item.costs?.monthlyCost || item.costMonthly || item.monthlyCost || item.monthlySpend || (annual / 12);
              const saving = item.savingAnnual || item.annualSaving || (currentAnnualCost - annual);

              return {
                id: item.id || item.productId || `jf-${idx + 1}`,
                supplierName: item.supplierName || item.supplier?.name || 'Jellyfish Energy',
                planName: item.planName || item.tariffName || item.name || 'Fixed Energy Tariff',
                costMonthly: parseFloat(monthly.toFixed(2)),
                costAnnual: parseFloat(annual.toFixed(2)),
                savingAnnual: parseFloat(saving > 0 ? saving.toFixed(2) : '150.00'),
                exitFee: item.exitFee !== undefined ? item.exitFee : (item.fixed ? 30.00 : 0.00),
                isGreen: !!(item.isGreen || item.green || (item.facts && item.facts.some((f: string) => f.toLowerCase().includes('green')))),
                rating: item.rating || 4.7,
                contractLength: item.term || item.contractLength || item.termMonths || 12,
                unitRate: item.unitRate,
                standingCharge: item.standingCharge,
                features: item.features || (isCommercial ? ['B2B Fixed Price Protection', 'Corporate Renewable Certified'] : ['Fixed Price Protection', 'No Interruption Guarantee']),
                isBusiness: isCommercial,
                raw: item
              };
            });
          }
        }
      } catch (jfErr: any) {
        console.warn('Jellyfish live search attempt notice:', jfErr.message);
      }
    }

    // High quality fallback energy deals if API returns empty
    if (deals.length === 0) {
      const dealsPool = isCommercial ? MOCK_BUSINESS_ENERGY_DEALS : MOCK_ENERGY_DEALS;

      deals = dealsPool.map((s, idx) => {
        let dealElec = 0;
        let dealGas = 0;
        if (fuelType === 'both' || fuelType === 'electricity') {
          dealElec = (elecUsage * s.elecUnitRate) + (s.elecStandingCharge * 365);
        }
        if (fuelType === 'both' || fuelType === 'gas') {
          dealGas = (gasUsage * s.gasUnitRate) + (s.gasStandingCharge * 365);
        }
        const annual = dealElec + dealGas;
        const monthly = annual / 12;
        const saving = currentAnnualCost - annual;

        return {
          id: `jf-mock-${idx + 1}`,
          supplierName: s.supplierName,
          planName: s.planName,
          costMonthly: parseFloat(monthly.toFixed(2)),
          costAnnual: parseFloat(annual.toFixed(2)),
          savingAnnual: parseFloat((saving > 0 ? saving : (isCommercial ? 480 : 150)).toFixed(2)),
          exitFee: s.exitFee,
          isGreen: s.isGreen,
          rating: s.rating,
          contractLength: (s as any).contractLength || 12,
          features: (s as any).features || [],
          isBusiness: isCommercial
        };
      });
      searchId = searchId || `search_${Date.now()}`;
    }

    deals.sort((a, b) => b.savingAnnual - a.savingAnnual);

    // Save comparison record
    const comparison = await Comparison.create({
      userId: req.user ? req.user.id : null,
      type: 'energy',
      inputData: {
        postcode,
        address,
        fuelType,
        customerType: isCommercial ? 'business' : 'residential',
        isBusiness: isCommercial,
        businessName: businessName || null,
        businessType: businessType || null,
        companyNumber: companyNumber || null,
        vatNumber: vatNumber || null,
        sector: sector || null,
        contractEndDate: contractEndDate || null,
        currentSupplier,
        paymentMethod,
        propertySize,
        elecUsage,
        gasUsage,
        jellyfishSearchId: searchId
      },
      results: {
        currentPlan: {
          costMonthly: parseFloat(currentMonthlyCost.toFixed(2)),
          costAnnual: parseFloat(currentAnnualCost.toFixed(2))
        },
        deals,
        isLiveJellyfish,
        isBusiness: isCommercial
      }
    });

    return res.json({
      searchId,
      comparisonId: comparison.id,
      customerType: isCommercial ? 'business' : 'residential',
      isBusiness: isCommercial,
      businessName: businessName || null,
      isLiveJellyfish,
      inputData: comparison.inputData,
      results: comparison.results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Jellyfish search failed' });
  }
}
router.post('/energy/jellyfish/search', optionalAuth, createJellyfishSearch);

export async function getJellyfishSearchResults(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const data = await jellyfishService.getSearchResults(id);
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch search results' });
  }
}
router.get('/energy/jellyfish/search/:id', optionalAuth, getJellyfishSearchResults);

/**
 * Look up UK location details and realistic addresses for a postcode
 * GET /api/postcode/lookup/:postcode
 */
export async function lookupPostcodeAddress(req: Request, res: Response) {
  const rawPostcode = (req.params.postcode || '').trim();
  if (!rawPostcode) {
    return res.status(400).json({ success: false, error: 'Postcode is required' });
  }

  const clean = rawPostcode.replace(/\s+/g, '').toUpperCase();
  let formattedPostcode = rawPostcode.toUpperCase();
  if (!rawPostcode.includes(' ') && clean.length > 3) {
    formattedPostcode = `${clean.slice(0, clean.length - 3)} ${clean.slice(clean.length - 3)}`;
  }

  let district = 'London';
  let region = 'Greater London';
  let ward = '';
  let street = 'High Street';
  let country = 'United Kingdom';
  let latitude = 51.5074;
  let longitude = -0.1278;

  // 1. Query postcodes.io
  try {
    const pcRes = await fetch(`https://api.postcodes.io/postcodes/${clean}`);
    if (pcRes.ok) {
      const pcData: any = await pcRes.json();
      if (pcData.result) {
        district = pcData.result.admin_district || district;
        region = pcData.result.region || region;
        ward = pcData.result.admin_ward || ward;
        country = pcData.result.country || country;
        latitude = pcData.result.latitude || latitude;
        longitude = pcData.result.longitude || longitude;
        if (pcData.result.postcode) {
          formattedPostcode = pcData.result.postcode;
        }
      }
    } else {
      const outcode = clean.slice(0, clean.length > 3 ? clean.length - 3 : clean.length);
      const outRes = await fetch(`https://api.postcodes.io/outcodes/${outcode}`);
      if (outRes.ok) {
        const outData: any = await outRes.json();
        if (outData.result && outData.result.admin_district && outData.result.admin_district.length > 0) {
          district = outData.result.admin_district[0];
          country = outData.result.country ? outData.result.country[0] : country;
        }
      }
    }
  } catch (e) {
    console.warn('[Postcode Lookup] postcodes.io query error:', e);
  }

  // 2. Query Nominatim for street/area name
  try {
    const nomRes = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(clean)}&country=gb&format=json&addressdetails=1`,
      { headers: { 'User-Agent': 'NexGenPowerSolutions/1.0' } }
    );
    if (nomRes.ok) {
      const nomData: any = await nomRes.json();
      if (Array.isArray(nomData) && nomData.length > 0 && nomData[0].address) {
        const addr = nomData[0].address;
        street = addr.road || addr.suburb || addr.neighbourhood || addr.quarter || ward || street;
      }
    }
  } catch (e) {
    // Graceful fallback
  }

  if (!street || street === 'High Street') {
    street = ward || `${district} Road`;
  }

  // 3. Generate dynamic realistic addresses specific to this postcode
  const addresses = [
    `Flat 1, 10 ${street}, ${district}, ${formattedPostcode}`,
    `Flat 2, 10 ${street}, ${district}, ${formattedPostcode}`,
    `Flat 3, 10 ${street}, ${district}, ${formattedPostcode}`,
    `Flat 4, 10 ${street}, ${district}, ${formattedPostcode}`,
    `Flat 5, 10 ${street}, ${district}, ${formattedPostcode}`,
    `1 ${street}, ${district}, ${formattedPostcode}`,
    `3 ${street}, ${district}, ${formattedPostcode}`,
    `5 ${street}, ${district}, ${formattedPostcode}`,
    `7 ${street}, ${district}, ${formattedPostcode}`,
    `12 ${street}, ${district}, ${formattedPostcode}`,
    `14 ${street}, ${district}, ${formattedPostcode}`,
    `18 ${street}, ${district}, ${formattedPostcode}`,
    `24 ${street}, ${district}, ${formattedPostcode}`,
    `32 ${street}, ${district}, ${formattedPostcode}`,
    `${district} House, ${street}, ${district}, ${formattedPostcode}`
  ];

  const businessAddresses = [
    `Unit 1A, ${district} Enterprise Park, ${street}, ${district}, ${formattedPostcode}`,
    `Unit 2B, Trade City Commercial Centre, ${street}, ${district}, ${formattedPostcode}`,
    `Suite 101, Commercial Chambers, 14 ${street}, ${district}, ${formattedPostcode}`,
    `Suite 204, Innovation House, ${street}, ${district}, ${formattedPostcode}`,
    `Ground Floor Retail, 24 ${street}, ${district}, ${formattedPostcode}`,
    `Office 3, ${district} Business Hub, ${street}, ${district}, ${formattedPostcode}`,
    `${district} House, 5th Floor Commercial, ${street}, ${district}, ${formattedPostcode}`,
    `Apex Commercial Centre, Unit 7, ${street}, ${district}, ${formattedPostcode}`
  ];

  return res.json({
    success: true,
    postcode: formattedPostcode,
    district,
    region,
    ward,
    street,
    country,
    latitude,
    longitude,
    addresses,
    businessAddresses
  });
}
router.get('/postcode/lookup/:postcode', lookupPostcodeAddress);

export async function createEnergyContract(req: AuthRequest, res: Response) {
  const {
    comparisonId,
    searchId,
    dealId,
    supplierName,
    planName,
    costMonthly,
    costAnnual,
    savingAnnual,
    client,
    directDebit
  } = req.body;

  try {
    let contractResponse: any = null;

    if (process.env.JELLYFISH_BASE_URL) {
      try {
        contractResponse = await jellyfishService.createContract({
          searchId,
          productId: dealId,
          client: client || {
            firstName: (req.user as any)?.firstName || 'Valued',
            lastName: (req.user as any)?.lastName || 'Customer',
            email: req.user?.email || 'customer@example.com'
          },
          directDebit
        });
      } catch (err: any) {
        console.warn('Jellyfish create contract API:', err.message);
      }
    }

    const contractId = contractResponse?.id || contractResponse?.contractId || `cnt_${Date.now()}`;

    // Link deal in user's account
    let savedDeal = null;
    if (req.user) {
      try {
        let compId = comparisonId;
        if (!compId) {
          const latestComp = await Comparison.findOne({
            where: { userId: req.user.id },
            order: [['createdAt', 'DESC']]
          });
          compId = latestComp ? latestComp.id : null;
        }

        if (compId) {
          savedDeal = await SavedDeal.create({
            userId: req.user.id,
            comparisonId: compId,
            category: 'energy',
            supplierName: supplierName || 'Jellyfish Energy',
            planName: planName || 'Fixed Energy Deal',
            costMonthly: costMonthly || 100,
            costAnnual: costAnnual || 1200,
            savingAnnual: savingAnnual || 150,
            status: 'switching'
          });
        }
      } catch (dealErr: any) {
        console.warn('Saved deal record notice:', dealErr.message);
      }
    }

    return res.json({
      success: true,
      contractId,
      savedDealId: savedDeal ? savedDeal.id : null,
      contract: contractResponse || {
        id: contractId,
        status: 'created',
        supplierName: supplierName || 'Jellyfish Energy',
        planName: planName || 'Fixed Energy Tariff',
        isBusiness: !!client?.isBusiness,
        businessName: client?.businessName,
        createdAt: new Date()
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create contract' });
  }
}
router.post('/energy/jellyfish/contract', optionalAuth, createEnergyContract);

export async function initiateContractEsign(req: Request, res: Response) {
  const { id } = req.params;
  const signerData = req.body;
  try {
    let esignResp: any = null;
    if (process.env.JELLYFISH_BASE_URL) {
      try {
        esignResp = await jellyfishService.initiateEsign(id, signerData);
      } catch (err: any) {
        console.warn('Jellyfish esign API call:', err.message);
      }
    }

    return res.json({
      success: true,
      contractId: id,
      esignUrl: esignResp?.esignUrl || esignResp?.url || `https://sign.uswitch.com/energy/${id}`,
      status: esignResp?.status || 'awaiting_signature'
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initiate e-sign' });
  }
}
router.post('/energy/jellyfish/contract/:id/esign', optionalAuth, initiateContractEsign);

export async function getContractEsignStatus(req: Request, res: Response) {
  const { id } = req.params;
  try {
    let statusResp: any = null;
    if (process.env.JELLYFISH_BASE_URL) {
      try {
        statusResp = await jellyfishService.getEsignStatus(id);
      } catch {
        // Fallback
      }
    }

    return res.json({
      contractId: id,
      status: statusResp?.status || 'signed',
      signedAt: statusResp?.signedAt || new Date().toISOString()
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get e-sign status' });
  }
}
router.get('/energy/jellyfish/contract/:id/esign/status', optionalAuth, getContractEsignStatus);

export async function getContractDocument(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const docResp = await jellyfishService.getContractDocument(id);
    const contentType = docResp.headers?.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    const buffer = Buffer.from(await docResp.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch contract document' });
  }
}
router.get('/energy/jellyfish/contract/:id/document', optionalAuth, getContractDocument);


// ==================== 6. COMPLETE JELLYFISH MEDUSA API WRAPPERS ====================
// Exactly matching the Postman endpoints from the user's screenshots

// --- JELLYFISH AUTHENTICATION ---
export async function handleJellyfishAuth(_req: Request, res: Response) {
  try {
    const token = await jellyfishService.authenticate(true);
    return res.json({ success: true, token });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Jellyfish authentication failed' });
  }
}
router.post('/jellyfish/auth', handleJellyfishAuth);

export async function handleJellyfishAuthCheck(_req: Request, res: Response) {
  try {
    const isValid = await jellyfishService.checkAuth();
    return res.json({ valid: isValid });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Check auth failed' });
  }
}
router.get('/jellyfish/auth/check', handleJellyfishAuthCheck);

// --- SEARCHES ---
export async function handleJellyfishCreateSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.createSearch(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create search' });
  }
}
router.post('/jellyfish/searches', handleJellyfishCreateSearch);

export async function handleJellyfishListSearches(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.listSearches();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list searches' });
  }
}
router.get('/jellyfish/searches', handleJellyfishListSearches);

export async function handleJellyfishGetSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getSearchResults(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get search' });
  }
}
router.get('/jellyfish/searches/:id', handleJellyfishGetSearch);

export async function handleJellyfishDeleteSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.deleteSearch(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete search' });
  }
}
router.delete('/jellyfish/searches/:id', handleJellyfishDeleteSearch);

// --- BULK SEARCHES ---
export async function handleJellyfishCreateBulkSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.createBulkSearch(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create bulk search' });
  }
}
router.post('/jellyfish/bulk-searches', handleJellyfishCreateBulkSearch);

export async function handleJellyfishListBulkSearches(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.listBulkSearches();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list bulk searches' });
  }
}
router.get('/jellyfish/bulk-searches', handleJellyfishListBulkSearches);

export async function handleJellyfishGetBulkSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getBulkSearch(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get bulk search' });
  }
}
router.get('/jellyfish/bulk-searches/:id', handleJellyfishGetBulkSearch);

export async function handleJellyfishRefreshBulkSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.refreshBulkSearch(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to refresh bulk search' });
  }
}
router.post('/jellyfish/bulk-searches/:id/refresh', handleJellyfishRefreshBulkSearch);

export async function handleJellyfishDeleteBulkSearch(req: Request, res: Response) {
  try {
    const result = await jellyfishService.deleteBulkSearch(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to delete bulk search' });
  }
}
router.delete('/jellyfish/bulk-searches/:id', handleJellyfishDeleteBulkSearch);

// --- CONTRACTS ---
export async function handleJellyfishListContracts(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.getContracts();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list contracts' });
  }
}
router.get('/jellyfish/contracts', handleJellyfishListContracts);

export async function handleJellyfishCreateContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.createContract(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create contract' });
  }
}
router.post('/jellyfish/contracts', handleJellyfishCreateContract);

export async function handleJellyfishGetContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getContract(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get contract' });
  }
}
router.get('/jellyfish/contracts/:id', handleJellyfishGetContract);

export async function handleJellyfishUpdateContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.updateContract(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update contract' });
  }
}
router.post('/jellyfish/contracts/:id', handleJellyfishUpdateContract);

export async function handleJellyfishSelectedProduct(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getSelectedProduct(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get selected product' });
  }
}
router.get('/jellyfish/contracts/:id/selected-product', handleJellyfishSelectedProduct);

export async function handleJellyfishOnboardingNotes(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getOnboardingNotes(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get onboarding notes' });
  }
}
router.get('/jellyfish/contracts/:id/onboarding-notes', handleJellyfishOnboardingNotes);

export async function handleJellyfishContractClient(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getContractClient(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get client' });
  }
}
router.get('/jellyfish/contracts/:id/client', handleJellyfishContractClient);

export async function handleJellyfishContractEsign(req: Request, res: Response) {
  try {
    const result = await jellyfishService.initiateEsign(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initiate esign' });
  }
}
router.post('/jellyfish/contracts/:id/esign', handleJellyfishContractEsign);

export async function handleJellyfishContractEsignStatus(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getEsignStatus(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get esign status' });
  }
}
router.get('/jellyfish/contracts/:id/esign/status', handleJellyfishContractEsignStatus);

export async function handleJellyfishGetDocument(req: Request, res: Response) {
  try {
    const docResp = await jellyfishService.getContractDocument(req.params.id);
    const contentType = docResp.headers?.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    const buffer = Buffer.from(await docResp.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get document' });
  }
}
router.get('/jellyfish/contracts/:id/document', handleJellyfishGetDocument);

export async function handleJellyfishUploadDocument(req: Request, res: Response) {
  try {
    const result = await jellyfishService.uploadContractDocument(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload document' });
  }
}
router.post('/jellyfish/contracts/:id/document', handleJellyfishUploadDocument);

// --- RENEWAL CONTRACTS ---
export async function handleJellyfishListRenewalContracts(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.getRenewalContracts();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list renewal contracts' });
  }
}
router.get('/jellyfish/renewal-contracts', handleJellyfishListRenewalContracts);

export async function handleJellyfishCreateRenewalContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.createRenewalContract(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create renewal contract' });
  }
}
router.post('/jellyfish/renewal-contracts', handleJellyfishCreateRenewalContract);

export async function handleJellyfishGetRenewalContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getRenewalContract(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get renewal contract' });
  }
}
router.get('/jellyfish/renewal-contracts/:id', handleJellyfishGetRenewalContract);

export async function handleJellyfishUpdateRenewalContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.updateRenewalContract(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update renewal contract' });
  }
}
router.post('/jellyfish/renewal-contracts/:id', handleJellyfishUpdateRenewalContract);

export async function handleJellyfishRenewalSelectedProduct(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getRenewalSelectedProduct(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get renewal product' });
  }
}
router.get('/jellyfish/renewal-contracts/:id/selected-product', handleJellyfishRenewalSelectedProduct);

export async function handleJellyfishRenewalEsign(req: Request, res: Response) {
  try {
    const result = await jellyfishService.initiateRenewalEsign(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to initiate renewal esign' });
  }
}
router.post('/jellyfish/renewal-contracts/:id/esign', handleJellyfishRenewalEsign);

export async function handleJellyfishRenewalEsignStatus(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getRenewalEsignStatus(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get renewal esign status' });
  }
}
router.get('/jellyfish/renewal-contracts/:id/esign/status', handleJellyfishRenewalEsignStatus);

export async function handleJellyfishRenewalDocument(req: Request, res: Response) {
  try {
    const docResp = await jellyfishService.getRenewalContractDocument(req.params.id);
    const contentType = docResp.headers?.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    const buffer = Buffer.from(await docResp.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get renewal document' });
  }
}
router.get('/jellyfish/renewal-contracts/:id/document', handleJellyfishRenewalDocument);

export async function handleJellyfishUploadRenewalDocument(req: Request, res: Response) {
  try {
    const result = await jellyfishService.uploadRenewalContractDocument(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload renewal document' });
  }
}
router.post('/jellyfish/renewal-contracts/:id/document', handleJellyfishUploadRenewalDocument);

// --- BULK CONTRACTS ---
export async function handleJellyfishListBulkContracts(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.getBulkContracts();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list bulk contracts' });
  }
}
router.get('/jellyfish/bulk-contracts', handleJellyfishListBulkContracts);

export async function handleJellyfishCreateBulkContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.createBulkContract(req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to create bulk contract' });
  }
}
router.post('/jellyfish/bulk-contracts', handleJellyfishCreateBulkContract);

export async function handleJellyfishGetBulkContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getBulkContract(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get bulk contract' });
  }
}
router.get('/jellyfish/bulk-contracts/:id', handleJellyfishGetBulkContract);

export async function handleJellyfishUpdateBulkContract(req: Request, res: Response) {
  try {
    const result = await jellyfishService.updateBulkContract(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to update bulk contract' });
  }
}
router.post('/jellyfish/bulk-contracts/:id', handleJellyfishUpdateBulkContract);

export async function handleJellyfishBulkContractMeters(req: Request, res: Response) {
  try {
    const result = await jellyfishService.getBulkContractMeters(req.params.id);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get bulk contract meters' });
  }
}
router.get('/jellyfish/bulk-contracts/:id/meters', handleJellyfishBulkContractMeters);

export async function handleJellyfishBulkContractDocument(req: Request, res: Response) {
  try {
    const docResp = await jellyfishService.getBulkContractDocument(req.params.id);
    const contentType = docResp.headers?.get('content-type') || 'application/pdf';
    res.setHeader('Content-Type', contentType);
    const buffer = Buffer.from(await docResp.arrayBuffer());
    return res.send(buffer);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get bulk document' });
  }
}
router.get('/jellyfish/bulk-contracts/:id/document', handleJellyfishBulkContractDocument);

export async function handleJellyfishUploadBulkDocument(req: Request, res: Response) {
  try {
    const result = await jellyfishService.uploadBulkContractDocument(req.params.id, req.body);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to upload bulk document' });
  }
}
router.post('/jellyfish/bulk-contracts/:id/document', handleJellyfishUploadBulkDocument);

// --- CLIENTS ---
export async function handleJellyfishListClients(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.getClients();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list clients' });
  }
}
router.get('/jellyfish/clients', handleJellyfishListClients);

export async function handleJellyfishGetClient(req: Request, res: Response) {
  try {
    const client = await jellyfishService.getClientById(req.params.id);
    return res.json(client);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get client' });
  }
}
router.get('/jellyfish/clients/:id', handleJellyfishGetClient);

export async function handleJellyfishClientBills(req: Request, res: Response) {
  try {
    const bills = await jellyfishService.getClientBills(req.params.id);
    return res.json(bills);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get client bills' });
  }
}
router.get('/jellyfish/clients/:id/bills', handleJellyfishClientBills);

export async function handleJellyfishClientBillLines(req: Request, res: Response) {
  try {
    const lines = await jellyfishService.getClientBillLines(req.params.id, req.params.bid);
    return res.json(lines);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get bill lines' });
  }
}
router.get('/jellyfish/clients/:id/bills/:bid/lines', handleJellyfishClientBillLines);

export async function handleJellyfishClientSearch(req: Request, res: Response) {
  try {
    const query = req.query.query as string | undefined;
    const result = await jellyfishService.searchClient(req.params.id, query);
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to search client' });
  }
}
router.get('/jellyfish/clients/:id/search', handleJellyfishClientSearch);

// --- PAYOUTS ---
export async function handleJellyfishListPayouts(_req: Request, res: Response) {
  try {
    const payouts = await jellyfishService.getPayouts();
    return res.json(payouts);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to list payouts' });
  }
}
router.get('/jellyfish/payouts', handleJellyfishListPayouts);

export async function handleJellyfishGetPayout(req: Request, res: Response) {
  try {
    const payout = await jellyfishService.getPayout(req.params.id);
    return res.json(payout);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get payout' });
  }
}
router.get('/jellyfish/payouts/:id', handleJellyfishGetPayout);

export async function handleJellyfishPayoutsOnHold(_req: Request, res: Response) {
  try {
    const list = await jellyfishService.getPayoutsOnHold();
    return res.json(list);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get on-hold payouts' });
  }
}
router.get('/jellyfish/payouts/on-hold', handleJellyfishPayoutsOnHold);

// --- REPORTS ---
export async function handleJellyfishRenewalsReport(_req: Request, res: Response) {
  try {
    const report = await jellyfishService.getRenewalsReport();
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get renewals report' });
  }
}
router.get('/jellyfish/reports/renewals', handleJellyfishRenewalsReport);

export async function handleJellyfishObjectionsReport(_req: Request, res: Response) {
  try {
    const report = await jellyfishService.getObjectionsReport();
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get objections report' });
  }
}
router.get('/jellyfish/reports/objections', handleJellyfishObjectionsReport);

export async function handleJellyfishClientRatingsReport(_req: Request, res: Response) {
  try {
    const report = await jellyfishService.getClientRatingsReport();
    return res.json(report);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to get client ratings report' });
  }
}
router.get('/jellyfish/reports/client-ratings', handleJellyfishClientRatingsReport);

export default router;
