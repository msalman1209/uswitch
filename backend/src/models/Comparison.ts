import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class Comparison extends Model {
  public id!: number;
  public userId?: number | null;
  public type!: 'energy' | 'broadband';
  public inputData!: any;
  public results!: any;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Comparison.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [['energy', 'broadband', 'sim', 'mobile']],
      },
    },
    inputData: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    results: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comparisons',
    underscored: true,
  }
);

export default Comparison;
