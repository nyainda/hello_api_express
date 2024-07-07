const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({ message: "Hello API Express is running", status: "success" });
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

module.exports = app;