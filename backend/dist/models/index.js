"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SmartMeter = exports.SavedDeal = exports.Comparison = exports.User = exports.sequelize = void 0;
exports.initDB = initDB;
const pg_1 = require("pg");
const db_1 = __importDefault(require("../config/db"));
exports.sequelize = db_1.default;
const User_1 = __importDefault(require("./User"));
exports.User = User_1.default;
const Comparison_1 = __importDefault(require("./Comparison"));
exports.Comparison = Comparison_1.default;
const SavedDeal_1 = __importDefault(require("./SavedDeal"));
exports.SavedDeal = SavedDeal_1.default;
const SmartMeter_1 = __importDefault(require("./SmartMeter"));
exports.SmartMeter = SmartMeter_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Set up relationships
User_1.default.hasMany(Comparison_1.default, { foreignKey: 'userId', as: 'comparisons' });
Comparison_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
User_1.default.hasMany(SavedDeal_1.default, { foreignKey: 'userId', as: 'savedDeals' });
SavedDeal_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
Comparison_1.default.hasMany(SavedDeal_1.default, { foreignKey: 'comparisonId', as: 'savedDeals' });
SavedDeal_1.default.belongsTo(Comparison_1.default, { foreignKey: 'comparisonId', as: 'comparison' });
User_1.default.hasMany(SmartMeter_1.default, { foreignKey: 'userId', as: 'smartMeterRecords' });
SmartMeter_1.default.belongsTo(User_1.default, { foreignKey: 'userId', as: 'user' });
async function ensureDatabaseExists() {
    const dbName = process.env.DB_NAME || 'uswitch';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASS || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    // Connect to default 'postgres' database first to execute CREATE DATABASE
    const client = new pg_1.Client({
        user: dbUser,
        password: dbPass,
        host: dbHost,
        port: dbPort,
        database: 'postgres',
    });
    try {
        await client.connect();
        // Check if database exists
        const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = $1`, [dbName]);
        if (res.rowCount === 0) {
            console.log(`Database "${dbName}" does not exist. Creating database...`);
            // CREATE DATABASE cannot run inside a transaction block, we run it directly on client
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database "${dbName}" created successfully.`);
        }
        else {
            console.log(`Database "${dbName}" already exists.`);
        }
    }
    catch (error) {
        console.error('Error verifying database existence:', error);
    }
    finally {
        await client.end();
    }
}
async function initDB() {
    try {
        const dbHost = process.env.DB_HOST || 'localhost';
        // 1. Ensure the PostgreSQL database exists (for local Postgres instances)
        if (dbHost === 'localhost' || dbHost === '127.0.0.1') {
            await ensureDatabaseExists();
        }
        // 2. Authenticate Sequelize
        await db_1.default.authenticate();
        console.log('Database connection has been established successfully.');
        // 3. Sync models
        await db_1.default.sync();
        console.log('Database schemas synchronized successfully.');
    }
    catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
