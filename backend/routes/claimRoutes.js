const express = require('express');
const router = express.Router();
const { getClaimsByPolicyNumbers } = require('../controllers/claimController');

router.get('/', getClaimsByPolicyNumbers);

module.exports = router;