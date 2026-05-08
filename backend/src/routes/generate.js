const express = require('express');
const auth = require('../middleware/auth');
const { generate, generateQuiz } = require('../controllers/generateController');

const router = express.Router();

// POST /api/generate
router.post('/', auth, generate);
// POST /api/generate/quiz
router.post('/quiz', auth, generateQuiz);

module.exports = router;
