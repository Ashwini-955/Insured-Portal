const express = require('express');
const router = express.Router();
const { getBillingByPolicy, getProjectedByStatus } = require('../controllers/billingController');

// GET /api/billing/policy/FPP2000002139-00
router.get('/policy/:policyNumber', getBillingByPolicy);

// GET /api/billing/status/Paid
router.get('/status/:status', getProjectedByStatus);

module.exports = router;