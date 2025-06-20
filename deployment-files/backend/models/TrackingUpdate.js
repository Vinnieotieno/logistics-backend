const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const TrackingUpdate = sequelize.define('TrackingUpdate', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  shipmentId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'shipment_id',
    references: {
      model: 'shipments',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  location: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    field: 'updated_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  latitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  longitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  }
}, {
  tableName: 'tracking_updates',
  underscored: true,
  updatedAt: false
});

// No associations here, only model definition
module.exports = TrackingUpdate;
