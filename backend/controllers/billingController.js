const Billing = require('../models/Billing');

// GET /api/billing?policyNumbers=FPP1,FPP2,FPP3
const getBillingByPolicyNumbers = async (req, res) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = raw.split(',').map((s) => s.trim()).filter(Boolean);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const billing = await Billing.find({ PolicyNumber: { $in: policyNumbers } })
      .select('-__v')
      .lean();

    res.status(200).json({
      success: true,
      count: billing.length,
      data: billing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getBillingByPolicyNumbers };