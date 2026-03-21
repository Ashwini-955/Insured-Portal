const Policy = require('../models/Policy');

// GET /api/policies/email/:email
const getPoliciesByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const policies = await Policy.find({
      'insured.email': { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    }).select('policyNumber status effectiveDate expirationDate policyType accountId');

    if (!policies || policies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No policies found for this email'
      });
    }

    res.status(200).json({
      success: true,
      count: policies.length,
      data: policies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getPoliciesByEmail };