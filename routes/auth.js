const express = require('express');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);

module.exports = router;