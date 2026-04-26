const Billing = require('../models/Billing');
const { sendPaymentEmail } = require('../utils/email');
const { sanitizePolicyNumbers, validateEmail, validatePolicyNumber } = require('../utils/validation');

// GET /api/billing?policyNumbers=FPP1,FPP2,FPP3
const getBillingByPolicyNumbers = async (req, res, next) => {
  try {
    const raw = req.query.policyNumbers || '';
    const policyNumbers = sanitizePolicyNumbers(raw);

    if (policyNumbers.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    // Validate policy numbers
    for (const pn of policyNumbers) {
      if (!validatePolicyNumber(pn)) {
        const error = new Error('Invalid policy number format');
        error.status = 400;
        throw error;
      }
    }

    const billing = await Billing.find({ PolicyNumber: { $in: policyNumbers } }).lean();

    res.status(200).json({
      success: true,
      count: billing.length,
      data: billing
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/billing/send-payment-email
const sendPaymentEmailController = async (req, res, next) => {
  try {
    const { policyNumber, email, amount } = req.body;

    // Validate inputs
    if (!policyNumber || !email || amount === undefined || amount === null) {
      const error = new Error('Policy number, email, and amount are required');
      error.status = 400;
      throw error;
    }

    if (!validatePolicyNumber(policyNumber)) {
      const error = new Error('Invalid policy number format');
      error.status = 400;
      throw error;
    }

    if (!validateEmail(email)) {
      const error = new Error('Invalid email format');
      error.status = 400;
      throw error;
    }

    if (typeof amount !== 'number' || amount <= 0) {
      const error = new Error('Amount must be a positive number');
      error.status = 400;
      throw error;
    }

    // Check if policy exists
    const billing = await Billing.findOne({ PolicyNumber: policyNumber }).lean();

    if (!billing) {
      const error = new Error('Policy not found');
      error.status = 404;
      throw error;
    }

    await sendPaymentEmail(email, policyNumber, amount);

    res.status(200).json({
      success: true,
      message: 'Payment email sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBillingByPolicyNumbers, sendPaymentEmailController };