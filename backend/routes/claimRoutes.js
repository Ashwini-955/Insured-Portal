const express = require('express');
const router = express.Router();
const { getClaimsByPolicy } = require('../controllers/claimController');

// GET /api/claims/policy/FPP2000002139-00
router.get('/policy/:policyNumber', getClaimsByPolicy);

module.exports = router;