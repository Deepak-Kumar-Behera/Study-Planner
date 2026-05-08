const express = require('express');
const auth = require('../middleware/auth');
const { getAllQuizScores } = require('../controllers/quizScoreController');

const router = express.Router();

// GET /api/quiz-scores
router.get('/', auth, getAllQuizScores);

module.exports = router;
