const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /api/auth/login - email-based login, returns user + policies + claims + billing
router.post('/login', login);

module.exports = router;
