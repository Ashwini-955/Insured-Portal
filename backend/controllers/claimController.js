const Claim = require('../models/Claim');

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

module.exports = { getClaimsByPolicy };