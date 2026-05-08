const express = require('express');
const auth = require('../middleware/auth');
const {
  getNotes,
  getPlans,
  getQuizzes,
  getRevisions,
  updateRevisionStatus,
  getAllInputs,
  getPlanInputs,
  getNoteInputs,
  getQuizInputs,
  getRevisionInputs,
  getPlansByInput,
  getNotesByInput,
  getQuizzesByInput,
  getRevisionsByInput
} = require('../controllers/dataController');

const router = express.Router();

// GET /api/notes
router.get('/notes', auth, getNotes);
// GET /api/plans
router.get('/plans', auth, getPlans);
// GET /api/quizzes
router.get('/quizzes', auth, getQuizzes);
// GET /api/revisions
router.get('/revisions', auth, getRevisions);
// GET all inputs ever created
router.get('/all-inputs', auth, getAllInputs);
// GET input lists
router.get('/plan-inputs', auth, getPlanInputs);
router.get('/note-inputs', auth, getNoteInputs);
router.get('/quiz-inputs', auth, getQuizInputs);
router.get('/revision-inputs', auth, getRevisionInputs);
// GET all data for a given inputId
router.get('/plans/input/:inputId', auth, getPlansByInput);
router.get('/notes/input/:inputId', auth, getNotesByInput);
router.get('/quizzes/input/:inputId', auth, getQuizzesByInput);
router.get('/revisions/input/:inputId', auth, getRevisionsByInput);
// PATCH /api/revisions/:id/status
router.patch('/revisions/:id/status', auth, updateRevisionStatus);

module.exports = router;
