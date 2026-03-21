const express = require('express');
const router = express.Router();
const { getPoliciesByEmail } = require('../controllers/policyController');

router.get('/email/:email', getPoliciesByEmail);

module.exports = router;