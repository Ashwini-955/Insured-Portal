const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sanitizeEmail, validateEmail } = require('../utils/validation');

const JWT_SECRET = process.env.JWT_SECRET || 'insured-portal-secret-key';

/**
 * POST /api/auth/login
 * Input:  { email }
 * Output: { success, token, user }
 */

const login = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email || typeof email !== 'string') {
      const error = new Error('Email is required');
      error.status = 400;
      throw error;
    }

    const sanitizedEmail = sanitizeEmail(email);

    if (!validateEmail(sanitizedEmail)) {
      const error = new Error('Invalid email format');
      error.status = 400;
      throw error;
    }

    const user = await User.findOne({ email: new RegExp('^' + sanitizedEmail + '$', 'i') }).lean();
    
    if (!user) {
      const error = new Error('No account with this email');
      error.status = 404;
      throw error;
    }

    if (user.isActive === false) {
      const error = new Error('Account is deactivated');
      error.status = 403;
      throw error;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id?.toString() || 'mock_id', email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { login };
