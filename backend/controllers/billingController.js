const Billing = require('../models/Billing');
const { sendPaymentEmail } = require('../utils/email');

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

// POST /api/billing/send-payment-email
const sendPaymentEmailController = async (req, res) => {
  try {
    const { policyNumber, email, amount } = req.body;

    if (!policyNumber || !email || !amount) {
      return res.status(400).json({ success: false, message: 'Policy number, email, and amount are required' });
    }

    // Check if policy exists
    const billingData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/billing.json'), 'utf8'));
    const billing = billingData.find(b => b.PolicyNumber === policyNumber);
    if (!billing) {
      return res.status(404).json({ success: false, message: 'Policy not found' });
    }

    await sendPaymentEmail(email, policyNumber, amount);

    res.status(200).json({ success: true, message: 'Payment email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getBillingByPolicyNumbers, sendPaymentEmailController };