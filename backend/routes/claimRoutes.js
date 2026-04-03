const express = require('express');
const router = express.Router();
const { getClaimsByPolicyNumbers, createClaim } = require('../controllers/claimController');

const upload = require('../middleware/uploadMiddleware');

router.get('/', getClaimsByPolicyNumbers);
router.post('/', upload.array('images', 5), createClaim);

module.exports = router;