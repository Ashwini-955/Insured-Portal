const express = require('express');
const router = express.Router();
const { getPoliciesByAccount } = require('../controllers/policyController');

// GET /api/policies/account/ACC-001
router.get('/account/:accountId', getPoliciesByAccount);

module.exports = router;