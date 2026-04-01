const Billing = require('../models/Billing');

const fs = require('fs');
const path = require('path');

// GET /api/billing?policyNumbers=FPP1,FPP2,FPP3
const getBillingByPolicyNumbers = async (req, res) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = raw.split(',').map((s) => s.trim()).filter(Boolean);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const billingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/billing.json'), 'utf8'));
    const billing = billingData.filter(b => policyNumbers.includes(b.PolicyNumber));

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

// GET /api/billing/invoices?policyNumber=FPP1
const getInvoicesByPolicyNumber = async (req, res) => {
  try {
    const policyNumber = req.query.policyNumber?.trim();

    if (!policyNumber) {
      return res.status(400).json({ success: false, message: 'Policy number is required' });
    }

    const billingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/billing.json'), 'utf8'));
    const billing = billingData.find(b => b.PolicyNumber === policyNumber);

    if (!billing) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    res.status(200).json({
      success: true,
      count: billing.projectedStatements?.length || 0,
      data: billing.projectedStatements || []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = { getBillingByPolicyNumbers, getInvoicesByPolicyNumber };