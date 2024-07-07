const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware for parsing JSON bodies
app.use(express.json());

// Import and use your route modules
const authRoutes = require('./routes/authRoutes');
const organisationRoutes = require('./routes/organisationRoutes');

app.use('/auth', authRoutes);
app.use('/api', organisationRoutes);

module.exports = app;
