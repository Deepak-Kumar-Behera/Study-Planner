const QuizSubmission = require('../models/QuizSubmission');
const Input = require('../models/Input');

// GET /api/quiz-scores?page=1&limit=10
exports.getAllQuizScores = async (req, res) => {
  const userId = req.user.userId;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  try {
    const total = await QuizSubmission.countDocuments({ userId });
    const submissions = await QuizSubmission.find({ userId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('inputId', 'value')
      .populate({
        path: 'answers.quizId',
        select: 'question options answer topic'
      })
      .lean();

    const quizScores = submissions.map(sub => ({
      id: sub._id,
      topic: sub.inputId?.value || 'Untitled',
      score: sub.score,
      total: sub.total,
      submittedAt: sub.submittedAt,
      gapAnalysis: sub.gapAnalysis || [],
      // Map populate result back to a flat structure for easier frontend consumption
      answers: (sub.answers || []).map(a => ({
        quizId: a.quizId?._id || a.quizId,
        question: a.quizId?.question || 'Question deleted',
        options: a.quizId?.options || [],
        correctAnswer: a.quizId?.answer || '',
        selected: a.selected,
        correct: a.correct,
        topic: a.quizId?.topic || 'General'
      }))
    }));

    res.json({
      data: quizScores,
      page,
      totalPages: Math.ceil(total / limit),
      total,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch quiz scores.' });
  }
};
