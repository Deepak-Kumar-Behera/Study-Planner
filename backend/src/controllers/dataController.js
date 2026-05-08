const Input = require('../models/Input');
const Note = require('../models/Note');
const Plan = require('../models/Plan');
const Quiz = require('../models/Quiz');
const Revision = require('../models/Revision');

// Get all inputs for the current user
exports.getAllInputs = async (req, res) => {
  try {
    const inputs = await Input.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch inputs.' });
  }
};

// Get unique input list for each type (returns [{_id, value}])
exports.getPlanInputs = async (req, res) => {
  try {
    const inputIds = await Plan.distinct('inputId', { userId: req.user.userId });
    const inputs = await Input.find({ _id: { $in: inputIds } });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plan inputs.' });
  }
};

exports.getNoteInputs = async (req, res) => {
  try {
    const inputIds = await Note.distinct('inputId', { userId: req.user.userId });
    const inputs = await Input.find({ _id: { $in: inputIds } });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch note inputs.' });
  }
};

exports.getQuizInputs = async (req, res) => {
  try {
    const inputIds = await Quiz.distinct('inputId', { userId: req.user.userId });
    const inputs = await Input.find({ _id: { $in: inputIds } });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quiz inputs.' });
  }
};

exports.getRevisionInputs = async (req, res) => {
  try {
    const inputIds = await Revision.distinct('inputId', { userId: req.user.userId });
    const inputs = await Input.find({ _id: { $in: inputIds } });
    res.json(inputs);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revision inputs.' });
  }
};

// Get all data for a given inputId for each type
exports.getPlansByInput = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.userId, inputId: req.params.inputId });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans for input.' });
  }
};

exports.getNotesByInput = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId, inputId: req.params.inputId });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes for input.' });
  }
};

exports.getQuizzesByInput = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user.userId, inputId: req.params.inputId });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes for input.' });
  }
};

exports.getRevisionsByInput = async (req, res) => {
  try {
    const revisions = await Revision.find({ userId: req.user.userId, inputId: req.params.inputId });
    res.json(revisions);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revisions for input.' });
  }
};

// Fetch paginated notes for a user
exports.getNotes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [notes, total] = await Promise.all([
      Note.find({ userId: req.user.userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Note.countDocuments({ userId: req.user.userId })
    ]);
    const nonttes = await Note.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    console.log('Fetched notes:', nonttes);
    res.json({ data: notes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch notes.' });
  }
};

// Fetch paginated plans for a user
exports.getPlans = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [plans, total] = await Promise.all([
      Plan.find({ userId: req.user.userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Plan.countDocuments({ userId: req.user.userId })
    ]);
    res.json({ data: plans, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch plans.' });
  }
};

// Fetch paginated quizzes for a user
exports.getQuizzes = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [quizzes, total] = await Promise.all([
      Quiz.find({ userId: req.user.userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Quiz.countDocuments({ userId: req.user.userId })
    ]);
    res.json({ data: quizzes, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch quizzes.' });
  }
};

// Fetch paginated revision topics for a user
exports.getRevisions = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  try {
    const [revisions, total] = await Promise.all([
      Revision.find({ userId: req.user.userId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Revision.countDocuments({ userId: req.user.userId })
    ]);
    res.json({ data: revisions, total, page, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch revisions.' });
  }
};

// Update revision status
exports.updateRevisionStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['pending', 'completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status.' });
  }
  try {
    const revision = await Revision.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      { status },
      { new: true }
    );
    if (!revision) return res.status(404).json({ message: 'Revision not found.' });
    res.json(revision);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update revision status.' });
  }
};
