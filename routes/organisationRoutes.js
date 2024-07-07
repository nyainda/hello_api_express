const express = require('express');
const router = express.Router();
const organisationController = require('../controllers/organisationController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /api/organisations - Get all organisations (Protected)
router.get('/', authMiddleware.authenticateToken, organisationController.getAllOrganisations);

// GET /api/organisations/:orgId - Get organisation by ID (Protected)
router.get('/:orgId', authMiddleware.authenticateToken, organisationController.getOrganisationById);

// POST /api/organisations - Create a new organisation (Protected)
router.post('/', authMiddleware.authenticateToken, organisationController.createOrganisation);

module.exports = router;
