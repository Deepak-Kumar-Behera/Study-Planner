const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const Input = require('../models/Input');

// Submit quiz answers and calculate score
exports.submitQuiz = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { answers } = req.body; // [{ quizId, selected }]
    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'No answers submitted.' });
    }
    // Fetch all quiz questions for the submitted ids
    const quizIds = answers.map(a => a.quizId);
    const quizzes = await Quiz.find({ _id: { $in: quizIds } });
    let correctCount = 0;
    const answerResults = answers.map(ans => {
      const quiz = quizzes.find(q => q._id.toString() === ans.quizId);
      const correct = quiz && quiz.answer === ans.selected;
      if (correct) correctCount++;
      return {
        quizId: ans.quizId,
        selected: ans.selected,
        correct
      };
    });
    // Infer inputId from the first quiz (if available)
    let inputId = null;
    if (quizzes.length > 0) {
      inputId = quizzes[0].inputId || null;
    }
    const submission = await QuizSubmission.create({
      userId,
      inputId,
      answers: answerResults,
      score: correctCount,
      total: answers.length
    });
    res.json({
      submissionId: submission._id,
      score: correctCount,
      total: answers.length,
      answers: answerResults
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to submit quiz.' });
  }
};

// Get latest quiz score for dashboard analytics
exports.getLatestQuizScore = async (req, res) => {
  try {
    const userId = req.user.userId;
    const latest = await QuizSubmission.findOne({ userId }).sort({ submittedAt: -1 });
    if (!latest) return res.json({ score: 0, total: 0 });
    res.json({ score: latest.score, total: latest.total });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz score.' });
  }
};
