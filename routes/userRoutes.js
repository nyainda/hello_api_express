const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/users/:id - Get user details (Protected)
router.get('/:id', authMiddleware.authenticateToken, userController.getUserById);

module.exports = router;
