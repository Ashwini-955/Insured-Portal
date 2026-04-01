const Policy = require('../models/Policy');

const fs = require('fs');
const path = require('path');

const getPoliciesByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const usersData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/users.json'), 'utf8'));
    const user = usersData.find(u => u.email.toLowerCase() === email);

    if (!user || (!user.policyNumbers && !user.policy_numbers)) {
      return res.status(404).json({
        success: false,
        message: 'No policies found for this email'
      });
    }
    
    const targetNumbers = user.policyNumbers || user.policy_numbers || [];

    const policiesData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/policies.json'), 'utf8'));
    const matched = policiesData.filter(p => targetNumbers.includes(p.PolicyNumber || p.policyNumber));

    const transformedPolicies = matched.map(p => ({
      policyNumber: p.PolicyNumber || p.policyNumber,
      status: p.PolicyStatus || p.status || 'Active',
      effectiveDate: p.EffectiveDate || p.effectiveDate,
      expirationDate: p.ExpirationDate || p.expirationDate,
      accountId: p.AccountId || p.accountId,
      policyType: 'Insurance Policy',
      insured: {
        email: user.email
      }
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