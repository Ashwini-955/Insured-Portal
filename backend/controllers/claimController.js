const Claim = require('../models/Claim');
const Policy = require('../models/Policy');

const getClaimsByPolicy = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const claims = await Claim.find({ policyNumber })
    .select('claimNumber claimAmount amountClaimed amountPaid');

    if (!claims || claims.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No claims found for this policy' 
      });
    }

    res.status(200).json({ 
      success: true, 
      count: claims.length,
      data: claims 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

const getClaimsByEmail = async (req, res) => {
  try {
    const email = (req.params.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const escapedEmail = email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const policies = await Policy.find({
      'insured.email': { $regex: new RegExp(`^${escapedEmail}$`, 'i') }
    }).select('policyNumber');

    const policyNumbers = policies.map((p) => p.policyNumber).filter(Boolean);
    if (policyNumbers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No policies found for this email'
      });
    }

    const claims = await Claim.find({ policyNumber: { $in: policyNumbers } })
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      count: claims.length,
      data: claims
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getClaimsByPolicy, getClaimsByEmail };