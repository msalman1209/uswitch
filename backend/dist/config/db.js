"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let sequelize;
if (process.env.DATABASE_URL) {
    sequelize = new sequelize_1.Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        logging: false, // Set to console.log for debugging SQL queries
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}
else {
    const dbName = process.env.DB_NAME || 'uswitch';
    const dbUser = process.env.DB_USER || 'postgres';
    const dbPass = process.env.DB_PASS || 'postgres';
    const dbHost = process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.DB_PORT || '5432', 10);
    sequelize = new sequelize_1.Sequelize(dbName, dbUser, dbPass, {
        host: dbHost,
        port: dbPort,
        dialect: 'postgres',
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    });
}
exports.default = sequelize;
