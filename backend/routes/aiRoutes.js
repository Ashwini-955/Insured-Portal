const express = require('express');
const router = express.Router();
const { analyzeImages } = require('../controllers/aiController');

router.post('/analyze-images', analyzeImages);

module.exports = router;
