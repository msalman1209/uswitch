import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/db';

export class SmartMeter extends Model {
  public id!: number;
  public userId!: number;
  public recordDate!: string;
  public gasUsageKwh!: number;
  public electricityUsageKwh!: number;
  public gasCost!: number;
  public electricityCost!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SmartMeter.init(
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
    recordDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gasUsageKwh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    electricityUsageKwh: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    gasCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    electricityCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'smart_meter_data',
    underscored: true,
  }
);

export default SmartMeter;
