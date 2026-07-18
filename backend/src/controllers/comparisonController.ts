import { Response } from 'express';
import { Comparison, SavedDeal, SmartMeter } from '../models';
import { AuthRequest } from '../middleware/auth';
import { Op } from 'sequelize';

// Mock Energy Suppliers & Deals data formula
const MOCK_ENERGY_DEALS = [
  {
    supplierName: 'Fuse Energy',
    planName: 'Fixed July 2026 (15m) V7',
    elecUnitRate: 0.205, // 20.5p
    elecStandingCharge: 0.45, // 45p/day
    gasUnitRate: 0.051, // 5.1p
    gasStandingCharge: 0.28, // 28p/day
    exitFee: 50.00, // per fuel
    isGreen: true,
    rating: 4.8
  },
  {
    supplierName: 'Octopus Energy',
    planName: 'Octopus Fixed 12M',
    elecUnitRate: 0.212, // 21.2p
    elecStandingCharge: 0.48, // 48p/day
    gasUnitRate: 0.053, // 5.3p
    gasStandingCharge: 0.29, // 29p/day
    exitFee: 75.00,
    isGreen: true,
    rating: 4.7
  },
  {
    supplierName: 'E.ON Next',
    planName: 'Next Fixed 1 Year',
    elecUnitRate: 0.218, // 21.8p
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

// Mock Broadband Deals
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

// Mock SIM-only deals data
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
    dataGb: -1, // Unlimited
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
    dataGb: -1, // Unlimited
    costMonthly: 15.00,
    contractLength: 12,
    features: ['Cheapest unlimited data', '5G at no extra cost', 'Go Roam around the world'],
    rating: 4.5
  },
  {
    providerName: 'Lyca Mobile',
    planName: 'National Saver 20GB',
    dataGb: 20,
    costMonthly: 5.00,
    contractLength: 1, // rolling contract
    features: ['No contract', 'No credit check', '100 international minutes'],
    rating: 4.0
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

// Mock Handset Mobile deals
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
    usageType, // 'estimate' or 'exact'
    propertySize, // 'small' (1-2 bed), 'medium' (3 bed), 'large' (4+ bed)
    annualElecKwh,
    annualGasKwh,
    fuelType // 'both' | 'electricity' | 'gas'
  } = req.body;

  try {
    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required' });
    }

    // 1. Determine Usage in kWh
    let elecUsage = 2900; // Medium default
    let gasUsage = 11500; // Medium default

    if (usageType === 'exact') {
      if (annualElecKwh) elecUsage = parseFloat(annualElecKwh);
      if (annualGasKwh) gasUsage = parseFloat(annualGasKwh);
    } else {
      if (propertySize === 'small') {
        elecUsage = 1800;
        gasUsage = 6000;
      } else if (propertySize === 'large') {
        elecUsage = 4300;
        gasUsage = 17000;
      }
    }

    // 2. Calculate Current Costs (Assume standard variable rates which are higher)
    // Average current cap rates: Elec: 24.5p, Gas: 6.2p. Standing: Elec: 60p/day, Gas: 31p/day
    const currentElecUnit = 0.245;
    const currentElecStanding = 0.60;
    const currentGasUnit = 0.062;
    const currentGasStanding = 0.31;

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

    // 3. Compute Deals based on mock supplier tariffs
    const deals = MOCK_ENERGY_DEALS.map(deal => {
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
        supplierName: deal.supplierName,
        planName: deal.planName,
        costMonthly: parseFloat(dealMonthlyCost.toFixed(2)),
        costAnnual: parseFloat(dealAnnualCost.toFixed(2)),
        savingAnnual: parseFloat(annualSaving.toFixed(2)),
        exitFee: deal.exitFee,
        isGreen: deal.isGreen,
        rating: deal.rating
      };
    }).sort((a, b) => b.savingAnnual - a.savingAnnual); // sort by highest saving

    // 4. Save to database
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

export async function runBroadbandComparison(req: AuthRequest, res: Response) {
  const { postcode, currentProvider, contractStatus } = req.body;

  try {
    if (!postcode) {
      return res.status(400).json({ error: 'Postcode is required' });
    }

    // Map deals. In a real application, filter based on speed checks.
    // Here we return our mock deals list.
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

export async function saveDeal(req: AuthRequest, res: Response) {
  const { comparisonId, category, supplierName, planName, costMonthly, costAnnual, savingAnnual } = req.body;

  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    // Validate comparison exists
    const comparison = await Comparison.findByPk(comparisonId);
    if (!comparison) {
      return res.status(404).json({ error: 'Comparison search record not found' });
    }

    // Create saved deal (set status to 'switching' to mock starting a switch)
    const savedDeal = await SavedDeal.create({
      userId: req.user.id,
      comparisonId,
      category,
      supplierName,
      planName,
      costMonthly,
      costAnnual,
      savingAnnual,
      status: 'switching' // immediately start the simulated switching journey!
    });

    return res.status(201).json(savedDeal);
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to save deal' });
  }
}

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

export async function updateSavedDealStatus(req: AuthRequest, res: Response) {
  const { id } = req.params;
  const { status } = req.body; // 'saved' | 'switching' | 'completed'

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
