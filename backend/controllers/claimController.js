const Claim = require('../models/Claim');

// GET /api/claims?policyNumbers=FPP1,FPP2,FPP3
const getClaimsByPolicyNumbers = async (req, res) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = raw.split(',').map((s) => s.trim()).filter(Boolean);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
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

module.exports = { getClaimsByPolicyNumbers };