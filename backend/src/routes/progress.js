const express = require('express');
const auth = require('../middleware/auth');
const { getProgress } = require('../controllers/progressController');

const router = express.Router();

// GET /api/progress
router.get('/', auth, getProgress);

module.exports = router;
