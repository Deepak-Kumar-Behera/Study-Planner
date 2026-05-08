const express = require('express');
const auth = require('../middleware/auth');
const { submitQuiz, getLatestQuizScore, getTopicDifficulty } = require('../controllers/quizController');

const router = express.Router();

// POST /api/quiz/submit
router.post('/submit', auth, submitQuiz);
// GET /api/quiz/score
router.get('/score', auth, getLatestQuizScore);
// GET /api/quiz/difficulty/:inputId
router.get('/difficulty/:inputId', auth, getTopicDifficulty);

module.exports = router;
