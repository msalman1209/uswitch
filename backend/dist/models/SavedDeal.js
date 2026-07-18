"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SavedDeal = void 0;
const sequelize_1 = require("sequelize");
const db_1 = __importDefault(require("../config/db"));
class SavedDeal extends sequelize_1.Model {
}
exports.SavedDeal = SavedDeal;
SavedDeal.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    comparisonId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'comparisons',
            key: 'id',
        },
        onDelete: 'CASCADE',
    },
    category: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [['energy', 'broadband', 'sim', 'mobile']],
        },
    },
    supplierName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    planName: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    costMonthly: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    costAnnual: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    savingAnnual: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: 'saved',
        validate: {
            isIn: [['saved', 'switching', 'completed']],
        },
    },
}, {
    sequelize: db_1.default,
    tableName: 'saved_deals',
    underscored: true,
});
exports.default = SavedDeal;
