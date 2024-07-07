
// db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_DATABASE, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
   // port: process.env.DB_PORT,
  dialect: 'postgres',
  port: process.env.DB_PORT
});

module.exports = sequelize;
