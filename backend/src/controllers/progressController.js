const QuizSubmission = require('../models/QuizSubmission');
const Input = require('../models/Input');

exports.getProgress = async (req, res) => {
  // You can access req.user for the authenticated user
  // TODO: Replace with real DB logic for all fields
  let quizScore = { score: 0, total: 0 };
  try {
    const submissions = await QuizSubmission.find({ userId: req.user.userId });
    if (submissions && submissions.length > 0) {
      const totalScore = submissions.reduce((sum, s) => sum + (s.score || 0), 0);
      const totalPossible = submissions.reduce((sum, s) => sum + (s.total || 0), 0);
      quizScore = {
        score: totalPossible > 0 ? Math.round((totalScore / submissions.length) * 100) / 100 : 0,
        total: totalPossible > 0 ? Math.round((totalPossible / submissions.length) * 100) / 100 : 0
      };
    }
  } catch {}
  // Import models
  const Note = require('../models/Note');
  const Plan = require('../models/Plan');
  const Revision = require('../models/Revision');

  let topicsStudied = 0;
  let notesGenerated = 0;
  let quizAttempts = 0;
  let revisionCompleted = 0;
  let recentStudyPlan = [];
  let recentTopics = [];

  try {
    // Topics studied: count of unique inputs
    const inputs = await Input.find({ userId: req.user.userId });
    topicsStudied = inputs.length;
    const plans = await Plan.find({ userId: req.user.userId });
    recentStudyPlan = plans.slice(-3).map(p => p.step || p.topic || p.title).reverse();

    // Notes generated: count of notes
    const notes = await Note.find({ userId: req.user.userId });
    notesGenerated = notes.length;

    // Quiz attempts: count of quiz submissions
    quizAttempts = await QuizSubmission.countDocuments({ userId: req.user.userId });

    // Revision completed: count of completed revisions
    revisionCompleted = await Revision.countDocuments({ userId: req.user.userId, status: 'completed' });

    // Recent inputs: last 3 unique inputIds from notes and plans
    const noteInputIds = notes.map(n => n.inputId).filter(Boolean);
    const planInputIds = plans.map(p => p.inputId).filter(Boolean);
    const allInputIds = Array.from(new Set([...noteInputIds, ...planInputIds])).slice(-3).reverse();
    // Fetch input values for recent inputIds
    const recentInputs = await Input.find({ _id: { $in: allInputIds } });
    recentTopics = recentInputs.map(i => i.value);
  } catch {}

  res.json({
    topicsStudied,
    notesGenerated,
    quizAttempts,
    revisionCompleted,
    recentStudyPlan,
    recentTopics,
    quizScore
  });
};
