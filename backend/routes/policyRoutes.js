const express = require('express');
const router = express.Router();
const { getPoliciesByAccount, getPoliciesByEmail } = require('../controllers/policyController');

// GET /api/policies/account/ACC-001
router.get('/account/:accountId', getPoliciesByAccount);

// GET /api/policies/email/nsingh@cogitate.us
router.get('/email/:email', getPoliciesByEmail);

module.exports = router;