const express = require('express');
const router = express.Router();
const { getClaimsByPolicyNumbers, createClaim } = require('../controllers/claimController');

router.get('/', getClaimsByPolicyNumbers);
router.post('/', createClaim);

module.exports = router;