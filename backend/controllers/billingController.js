const Billing = require('../models/Billing');

// API to Get billing info by policyNumber
const getBillingByPolicy = async (req, res) => {
  try {
    const { policyNumber } = req.params;

    const billing = await Billing.findOne({ policyNumber });

    if (!billing) {
      return res.status(404).json({
        success: false,
        message: 'No billing found for this policy'
      });
    }

    res.status(200).json({
      success: true,
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

    // Use aggregation to find all projectedStatements matching the status
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