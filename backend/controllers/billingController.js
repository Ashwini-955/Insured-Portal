const Billing = require('../models/Billing');
const Policy = require('../models/Policy');

// Get billing info by policyNumber
const getBillingByPolicy = async (req, res) => {
  try {
    const { policyNumber } = req.params;
    const billing = await Billing.findOne({ policyNumber })
    .select('billingId payPlanDesc totalAccountBalance currentAmountDue currentDueDate');
    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'No billing found for this policy'
      });
    }
    res.status(200).json({
      success: true,
      count: billing?1:0,
      data: billing
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ApI to get the Status
const getProjectedByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    const projectedInfo = await Billing.aggregate([
      { $unwind: '$projectedStatements' },
      { $match: { 'projectedStatements.status': { $regex: new RegExp(`^${status}$`, 'i') } } },
      {
        $project: {
          _id: 0,
          policyNumber: 1,
          accountId: 1,
          billingId: 1,
          statement: '$projectedStatements'
        }
      }
    ]);
    if (!projectedInfo || projectedInfo.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No projected statements found with status: ${status}`
      });
    }
    res.status(200).json({
      success: true,
      count: projectedInfo.length,
      data: projectedInfo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getBillingByPolicy, getProjectedByStatus };

// Get billing info for all policies belonging to an insured email
// Returns an array (one Billing per policyNumber if present)
module.exports.getBillingByEmail = async (req, res) => {
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

    const billing = await Billing.find({ policyNumber: { $in: policyNumbers } })
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