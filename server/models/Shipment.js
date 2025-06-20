const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Shipment = sequelize.define('Shipment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  trackingNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'tracking_number'
  },
  senderName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'sender_name'
  },
  senderEmail: {
    type: DataTypes.STRING,
    field: 'sender_email'
  },
  senderPhone: {
    type: DataTypes.STRING(50),
    field: 'sender_phone'
  },
  senderAddress: {
    type: DataTypes.TEXT,
    field: 'sender_address'
  },
  receiverName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'receiver_name'
  },
  receiverEmail: {
    type: DataTypes.STRING,
    field: 'receiver_email'
  },
  receiverPhone: {
    type: DataTypes.STRING(50),
    field: 'receiver_phone'
  },
  receiverAddress: {
    type: DataTypes.TEXT,
    field: 'receiver_address'
  },
  packageDescription: {
    type: DataTypes.TEXT,
    field: 'package_description'
  },
  weight: {
    type: DataTypes.DECIMAL(10, 2)
  },
  dimensions: {
    type: DataTypes.STRING(100)
  },
  cbm: {
    type: DataTypes.DECIMAL(10, 4)
  },
  declaredValue: {
    type: DataTypes.DECIMAL,
    field: 'declared_value'
  },
  serviceType: {
    type: DataTypes.STRING(100),
    field: 'service_type'
  },
  origin: {
    type: DataTypes.STRING
  },
  destination: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'pending'
  },
  createdBy: {
    type: DataTypes.INTEGER,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  mode: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  packageName: {
    type: DataTypes.STRING,
    field: 'package_name'
  },
  numberOfPackages: {
    type: DataTypes.INTEGER,
    field: 'number_of_packages'
  },
  isDangerousGood: {
    type: DataTypes.BOOLEAN,
    field: 'is_dangerous_good',
    defaultValue: false
  },
  unNumber: {
    type: DataTypes.STRING,
    field: 'un_number'
  },
  createdAt: {
    type: DataTypes.DATE,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    field: 'updated_at'
  }
}, {
  tableName: 'shipments',
  underscored: true
});

module.exports = Shipment;