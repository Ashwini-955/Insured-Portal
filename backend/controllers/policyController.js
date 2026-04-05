const Policy = require('../models/Policy');
const User = require('../models/User');


const getPoliciesByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const matched = await Policy.find({ 'insured.email': new RegExp('^' + email + '$', 'i') });

    const transformedPolicies = matched.map(p => ({
      policyNumber: p.PolicyNumber || p.policyNumber,
      status: p.PolicyStatus || p.status || 'Active',
      effectiveDate: p.EffectiveDate || p.effectiveDate,
      expirationDate: p.ExpirationDate || p.expirationDate,
      accountId: p.AccountId || p.accountId,
      policyType: p.policyType || 'Insurance Policy',
      insured: {
        email: p.insured?.email || email
      },
      propertyAddress: p.propertyAddress || null,
      coverages: p.coverages || []
    }));

    if (!transformedPolicies || transformedPolicies.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No policies found for this email'
      });
    }

    res.status(200).json({
      success: true,
      count: transformedPolicies.length,
      data: transformedPolicies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getPoliciesByEmail };