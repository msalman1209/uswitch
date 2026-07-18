import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class SavedDeal extends Model {
  public id!: number;
  public userId!: number;
  public comparisonId!: number;
  public category!: 'energy' | 'broadband';
  public supplierName!: string;
  public planName!: string;
  public costMonthly!: number;
  public costAnnual!: number;
  public savingAnnual!: number;
  public status!: 'saved' | 'switching' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SavedDeal.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    comparisonId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'comparisons',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['energy', 'broadband', 'sim', 'mobile']],
      },
    },
    supplierName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    planName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    costMonthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    costAnnual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    savingAnnual: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'saved',
      validate: {
        isIn: [['saved', 'switching', 'completed']],
      },
    },
  },
  {
    sequelize,
    tableName: 'saved_deals',
    underscored: true,
  }
);

export default SavedDeal;
