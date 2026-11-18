import { Client } from 'pg';
import sequelize from '../config/db';
import User from './User';
import Comparison from './Comparison';
import SavedDeal from './SavedDeal';
import SmartMeter from './SmartMeter';
import dotenv from 'dotenv';

dotenv.config();

// Set up relationships
User.hasMany(Comparison, { foreignKey: 'userId', as: 'comparisons' });
Comparison.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(SavedDeal, { foreignKey: 'userId', as: 'savedDeals' });
SavedDeal.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Comparison.hasMany(SavedDeal, { foreignKey: 'comparisonId', as: 'savedDeals' });
SavedDeal.belongsTo(Comparison, { foreignKey: 'comparisonId', as: 'comparison' });

User.hasMany(SmartMeter, { foreignKey: 'userId', as: 'smartMeterRecords' });
SmartMeter.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { sequelize, User, Comparison, SavedDeal, SmartMeter };

async function ensureDatabaseExists() {
  const dbName = process.env.DB_NAME || 'uswitch';
  const dbUser = process.env.DB_USER || 'postgres';
  const dbPass = process.env.DB_PASS || 'postgres';
  const dbHost = process.env.DB_HOST || 'localhost';
  const dbPort = parseInt(process.env.DB_PORT || '5432', 10);

  // Connect to default 'postgres' database first to execute CREATE DATABASE
  const client = new Client({
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
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (error) {
    console.error('Error verifying database existence:', error);
  } finally {
    await client.end();
  }
}

export async function initDB() {
  try {
    const dbHost = process.env.DB_HOST || 'localhost';
    // 1. Ensure the PostgreSQL database exists (for local Postgres instances)
    if (dbHost === 'localhost' || dbHost === '127.0.0.1') {
      await ensureDatabaseExists();
    }

    // 2. Authenticate Sequelize
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
    
    // 3. Sync models
    await sequelize.sync();
    console.log('Database schemas synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
