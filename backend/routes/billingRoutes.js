const express = require('express');
const router = express.Router();
const { getBillingByPolicyNumbers, getInvoicesByPolicyNumber } = require('../controllers/billingController');

router.get('/', getBillingByPolicyNumbers);
router.get('/invoices', getInvoicesByPolicyNumber);

module.exports = router;