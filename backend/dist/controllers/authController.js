"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.login = login;
exports.getProfile = getProfile;
exports.updateProfile = updateProfile;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const models_1 = require("../models");
const JWT_SECRET = process.env.JWT_SECRET || 'uswitchsecrettokenkey123!';
// Seed some smart meter data for new users
async function seedSmartMeterDataForUser(userId) {
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
    await models_1.SmartMeter.bulkCreate(data);
}
async function register(req, res) {
    const { email, password, firstName, lastName, postcode, phone } = req.body;
    try {
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await models_1.User.create({
            email,
            passwordHash,
            firstName,
            lastName,
            postcode,
            phone,
        });
        // Seed dummy smart meter data for this user to make Utrack work immediately
        await seedSmartMeterDataForUser(user.id);
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Registration failed' });
    }
}
async function login(req, res) {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }
        const user = await models_1.User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email }, JWT_SECRET, {
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Login failed' });
    }
}
async function getProfile(req, res) {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await models_1.User.findByPk(req.user.id);
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
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to fetch profile' });
    }
}
async function updateProfile(req, res) {
    const { firstName, lastName, postcode, phone } = req.body;
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await models_1.User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (firstName)
            user.firstName = firstName;
        if (lastName)
            user.lastName = lastName;
        if (postcode)
            user.postcode = postcode;
        if (phone)
            user.phone = phone;
        await user.save();
        return res.json({
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            postcode: user.postcode,
            phone: user.phone,
        });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to update profile' });
    }
}
