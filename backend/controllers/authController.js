const User = require('../models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insured-portal-secret-key';

/**
 * POST /api/auth/login
 * Input:  { email }
 * Output: { success, token, user }
 *
 * Policies, claims, billing are fetched separately:
 * 1) GET /api/policies/email/:email
 * 2) GET /api/claims?policyNumbers=...
 * 3) GET /api/billing?policyNumbers=...
 */
const fs = require('fs');
const path = require('path');

const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const unescapedEmail = email.trim().toLowerCase();

    // 1. Find user by email from JSON
    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
    const user = usersData.find(u => u.email.toLowerCase() === unescapedEmail);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with this email'
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // 2. Generate JWT
    const token = jwt.sign(
      { userId: user._id || 'mock_id', email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Login failed'
    });
  }
};

module.exports = { login };
