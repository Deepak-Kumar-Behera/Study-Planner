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
  } catch { }
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
    // Recent topics: last 5 unique input values that have associated notes or plans
    const notesWithInput = await Note.find({ userId: req.user.userId }).select('inputId').lean();
    const plansWithInput = await Plan.find({ userId: req.user.userId }).select('inputId').lean();
    const inputIdsWithContent = [
      ...new Set([
        ...notesWithInput.map(n => n.inputId?.toString()),
        ...plansWithInput.map(p => p.inputId?.toString())
      ])
    ].filter(Boolean);

    // Topics studied: count of unique inputs that have notes or plans
    topicsStudied = inputIdsWithContent.length;

    const plans = await Plan.find({ userId: req.user.userId });
    recentStudyPlan = plans.slice(-3).map(p => p.step || p.topic || p.title).reverse();

    // Notes generated: count of notes
    const notes = await Note.find({ userId: req.user.userId });
    notesGenerated = notes.length;

    // Quiz attempts: count of quiz submissions
    quizAttempts = await QuizSubmission.countDocuments({ userId: req.user.userId });

    // Revision completed: count of completed revisions
    revisionCompleted = await Revision.countDocuments({ userId: req.user.userId, status: 'completed' });

    const recentInputs = await Input.find({ 
      userId: req.user.userId,
      _id: { $in: inputIdsWithContent }
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('value')
      .lean();
    
    recentTopics = recentInputs.map(i => i.value);

  } catch { }



  res.json({
    topicsStudied,
    notesGenerated,
    quizAttempts,
    revisionCompleted,
    recentTopics,
    quizScore
  });
};
