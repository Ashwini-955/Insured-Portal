const express = require('express');
const router = express.Router();
const { getBillingByPolicyNumbers, sendPaymentEmailController } = require('../controllers/billingController');

router.get('/', getBillingByPolicyNumbers);
router.post('/send-payment-email', sendPaymentEmailController);

module.exports = router;