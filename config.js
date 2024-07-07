// config.js

require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'default_jwt_secret',
  JWT_EXPIRATION: process.env.JWT_EXPIRATION || '1h',
  DATABASE_URL: process.env.DATABASE_URL || 'default_database_url',
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
};