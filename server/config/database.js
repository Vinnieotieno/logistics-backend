// /server/config/database.js
require('dotenv').config({ path: __dirname + '/../.env' });
const { Sequelize } = require('sequelize');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is missing in .env file');
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

module.exports = sequelize;
