"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Comparison = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class Comparison extends sequelize_1.Model {
}
exports.Comparison = Comparison;
Comparison.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'SET NULL',
    },
    type: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['energy', 'broadband', 'sim', 'mobile']],
        },
    },
    inputData: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
    results: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
    },
}, {
    sequelize: db_1.default,
    tableName: 'comparisons',
    underscored: true,
});
exports.default = Comparison;
