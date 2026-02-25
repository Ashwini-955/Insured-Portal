const Policy = require('../models/Policy');
//get policies by accountId
const getPoliciesByAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const policies = await Policy.find({ accountId })
    .select('policyNumber status effectiveDate expirationDate');
    if (!policies || policies.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No policies found for this account' 
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

module.exports = { getPoliciesByAccount };