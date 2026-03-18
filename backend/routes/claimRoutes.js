const express = require('express');
const router = express.Router();
const { getClaimsByPolicy, getClaimsByEmail } = require('../controllers/claimController');

// GET /api/claims/policy/FPP2000002139-00
router.get('/policy/:policyNumber', getClaimsByPolicy);

// GET /api/claims/email/nsingh@cogitate.us
router.get('/email/:email', getClaimsByEmail);

module.exports = router;