const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Organisation = require('../models/Organisation');
const config = require('../config');
exports.register = async (req, res) => {
  const { firstName, lastName, email, password, phone } = req.body;

  try {
    const user = await User.create(firstName, lastName, email, password, phone);

    // Create default organisation
    const orgName = `${firstName}'s Organisation`;
    const org = await Organisation.create(orgName, '');

    // Link user to organisation
    await Organisation.addUser(org.org_id, user.user_id);

    const token = jwt.sign({ userId: user.user_id, email: user.email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION});

    res.status(201).json({
      status: 'success',
      message: 'Registration successful',
      data: {
        accessToken: token,
        user: {
          userId: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    if (error.code === '23505' && error.constraint === 'users_email_key') {
      // Handle duplicate email error
      res.status(400).json({
        status: 'Bad request',
        message: 'Email already exists. Please use a different email address.',
      });
    } else {
      console.error(error);
      res.status(400).json({
        status: 'Bad request',
        message: 'Registration unsuccessful',
      });
    }
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findByEmail(email);

    if (!user || !(await User.verifyPassword(user, password))) {
      return res.status(401).json({
        status: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ userId: user.user_id, email: user.email }, config.JWT_SECRET, { expiresIn: config.JWT_EXPIRATION});

    res.status(200).json({
      status: 'success',
      message: 'Login successful',
      data: {
        accessToken: token,
        user: {
          userId: user.user_id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          phone: user.phone,
        },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
