const express = require('express');
const router = express.Router();
const { getBillingByPolicyNumbers } = require('../controllers/billingController');

router.get('/', getBillingByPolicyNumbers);

module.exports = router;