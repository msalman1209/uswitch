import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, SmartMeter } from '../models';
import { AuthRequest } from '../middleware/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'uswitchsecrettokenkey123!';

// Seed some smart meter data for new users
async function seedSmartMeterDataForUser(userId: number) {
  const data = [];
  const now = new Date();
  
  // Seed last 30 days of usage
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateString = date.toISOString().split('T')[0];
    
    // Average household stats:
    // Electricity: 7-9 kWh/day, Gas: ~25-30 kWh/day
    // Electricity unit rate: ~24p/kWh, Gas: ~6p/kWh. Standing charge: ~50p/day electricity, ~30p/day gas.
    const elecUsage = 6 + Math.random() * 5; // 6-11 kWh
    const gasUsage = 15 + Math.random() * 20; // 15-35 kWh
    
    const elecCost = elecUsage * 0.24 + 0.50;
    const gasCost = gasUsage * 0.06 + 0.30;

    data.push({
      userId,
      recordDate: dateString,
      electricityUsageKwh: parseFloat(elecUsage.toFixed(2)),
      gasUsageKwh: parseFloat(gasUsage.toFixed(2)),
      electricityCost: parseFloat(elecCost.toFixed(2)),
      gasCost: parseFloat(gasCost.toFixed(2)),
    });
  }

  await SmartMeter.bulkCreate(data);
}

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
      phone,
    });

    // Seed dummy smart meter data for this user to make Utrack work immediately
    await seedSmartMeterDataForUser(user.id);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: '24h',
    });

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        postcode: user.postcode,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
}

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
      expiresIn: '24h',
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        postcode: user.postcode,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
}

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
      phone: user.phone,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch profile' });
  }
}

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
      phone: user.phone,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update profile' });
  }
}
