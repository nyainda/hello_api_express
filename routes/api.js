const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const { validateOrganisation } = require('../middleware/validation');
const { getUser } = require('../controllers/userController');
const { 
  getAllOrganisations, 
  getOrganisation, 
  createOrganisation, 
  addUserToOrganisation 
} = require('../controllers/organisationController');

const router = express.Router();

router.get('/users/:id', authenticateToken, getUser);
router.get('/organisations', authenticateToken, getAllOrganisations);
router.get('/organisations/:orgId', authenticateToken, getOrganisation);
router.post('/organisations', authenticateToken, validateOrganisation, createOrganisation);
router.post('/organisations/:orgId/users', authenticateToken, addUserToOrganisation);

module.exports = router;