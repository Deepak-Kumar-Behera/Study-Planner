const express = require('express');
const auth = require('../middleware/auth');
const { submitQuiz, getLatestQuizScore } = require('../controllers/quizController');

const router = express.Router();

// POST /api/quiz/submit
router.post('/submit', auth, submitQuiz);
// GET /api/quiz/score
router.get('/score', auth, getLatestQuizScore);

module.exports = router;
