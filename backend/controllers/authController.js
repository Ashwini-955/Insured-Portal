const User = require('../models/User');
const Policy = require('../models/Policy');
const Claim = require('../models/Claim');
const Billing = require('../models/Billing');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'insured-portal-secret-key';

/**
 * POST /api/auth/login
 * Input:  { email }
 * Output: { success, token, user, policies, claims, billing }
 *
 * Uses EMAIL only - no accountId in API.
 * Policies/claims/billing are fetched by matching insured.email in policies.
 */
const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const escapedEmail = normalizedEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // 1. Find user by email
    const user = await User.findOne({ email: { $regex: new RegExp(`^${escapedEmail}$`, 'i') } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account with this email'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // 2. Fetch policies by insured.email (email-based lookup - no accountId)
    const policies = await Policy.find({ 'insured.email': { $regex: new RegExp(`^${escapedEmail}$`, 'i') } })
      .select('-__v')
      .lean();

    const policyNumbers = policies.map(p => p.policyNumber);

    // 3. Fetch claims for these policies
    const claims = policyNumbers.length > 0
      ? await Claim.find({ policyNumber: { $in: policyNumbers } }).select('-__v').lean()
      : [];

    // 4. Fetch billing for these policies
    const billing = policyNumbers.length > 0
      ? await Billing.find({ policyNumber: { $in: policyNumbers } }).select('-__v').lean()
      : [];

    // 5. Generate JWT
    // expiration can be shortened by setting JWT_EXPIRES in your .env (e.g. '1h' or '30m')
    const token = jwt.sign(
      { userId: user._id, email: user.email },
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
      },
      policies,
      claims,
      billing
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
