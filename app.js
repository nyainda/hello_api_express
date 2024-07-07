const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

module.exports = app;