const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Input = require('../models/Input');
const Note = require('../models/Note');
const Plan = require('../models/Plan');
const Revision = require('../models/Revision');
const QuizSubmission = require('../models/QuizSubmission');

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid admin credentials.' });
    }
    const token = jwt.sign(
      { userId: user._id, username: user.username, email: user.email, isAdmin: true },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '2h' }
    );
    res.json({ token, admin: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const search = (req.query.search || '').trim();

    const filter = { isAdmin: { $ne: true } };
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email:    { $regex: search, $options: 'i' } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter, '-password')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    res.json({ users, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id, '-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // All inputs (subjects) for this user
    const inputs = await Input.find({ userId: id }).sort({ createdAt: -1 });
    const inputIds = inputs.map(i => i._id);

    // Counts per input in parallel
    const [noteCounts, planCounts, revisionDocs, quizSubmissions] = await Promise.all([
      Note.aggregate([
        { $match: { userId: user._id, inputId: { $in: inputIds } } },
        { $group: { _id: '$inputId', count: { $sum: 1 } } },
      ]),
      Plan.aggregate([
        { $match: { userId: user._id, inputId: { $in: inputIds } } },
        { $group: { _id: '$inputId', count: { $sum: 1 } } },
      ]),
      Revision.find({ userId: id, inputId: { $in: inputIds } }),
      QuizSubmission.find({ userId: id })
        .sort({ submittedAt: -1 })
        .populate({ path: 'inputId', select: 'value' }),
    ]);

    // Build lookup maps
    const noteMap     = Object.fromEntries(noteCounts.map(x => [x._id.toString(), x.count]));
    const planMap     = Object.fromEntries(planCounts.map(x => [x._id.toString(), x.count]));

    const revisionMap = {};
    const revisionDoneMap = {};
    revisionDocs.forEach(r => {
      const key = r.inputId.toString();
      revisionMap[key]     = (revisionMap[key] || 0) + 1;
      if (r.status === 'completed') revisionDoneMap[key] = (revisionDoneMap[key] || 0) + 1;
    });

    const quizCountMap = {};
    quizSubmissions.forEach(q => {
      const key = q.inputId?._id?.toString();
      if (key) quizCountMap[key] = (quizCountMap[key] || 0) + 1;
    });

    // Enrich inputs — only include those with at least notes or a plan
    const enrichedInputs = inputs
      .map(inp => {
        const key = inp._id.toString();
        return {
          _id: key,
          value: inp.value,
          createdAt: inp.createdAt,
          noteCount:          noteMap[key]         || 0,
          planCount:          planMap[key]          || 0,
          revisionTotal:      revisionMap[key]      || 0,
          revisionCompleted:  revisionDoneMap[key]  || 0,
          quizAttempts:       quizCountMap[key]     || 0,
        };
      })
      .filter(inp => inp.noteCount > 0 || inp.planCount > 0);

    // Quiz summary
    const totalAttempts = quizSubmissions.length;
    const avgScore = totalAttempts
      ? Math.round(quizSubmissions.reduce((sum, q) => sum + (q.score / q.total) * 100, 0) / totalAttempts)
      : 0;

    // Topic performance across all attempts (aggregate gapAnalysis)
    const topicMap = {};
    quizSubmissions.forEach(q => {
      (q.gapAnalysis || []).forEach(g => {
        if (!g.topic) return;
        if (!topicMap[g.topic]) topicMap[g.topic] = { correct: 0, total: 0 };
        topicMap[g.topic].correct += g.score  || 0;
        topicMap[g.topic].total   += g.total  || 0;
      });
    });
    const topicPerformance = Object.entries(topicMap).map(([topic, v]) => ({
      topic,
      correct: v.correct,
      total: v.total,
      pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
    })).sort((a, b) => a.pct - b.pct);

    res.json({
      user,
      stats: {
        totalInputs:         enrichedInputs.length,
        totalQuizAttempts:   totalAttempts,
        avgScore,
        totalRevisions:      revisionDocs.length,
        completedRevisions:  revisionDocs.filter(r => r.status === 'completed').length,
      },
      inputs: enrichedInputs,
      quizAttempts: quizSubmissions.map(q => ({
        _id:         q._id,
        submittedAt: q.submittedAt,
        score:       q.score,
        total:       q.total,
        pct:         Math.round((q.score / q.total) * 100),
        inputValue:  q.inputId?.value || '—',
        gapAnalysis: q.gapAnalysis,
      })),
      topicPerformance,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};
