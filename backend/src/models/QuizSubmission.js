const mongoose = require('mongoose');

const quizSubmissionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'Input' }, // input reference (optional for backward compatibility)
  submittedAt: { type: Date, default: Date.now },
  answers: [
    {
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
      selected: { type: String, required: true },
      correct: { type: Boolean, required: true }
    }
  ],
  gapAnalysis: [
    {
      topic: { type: String },
      score: { type: Number },
      total: { type: Number },
      status: { type: String } // 'weak', 'ok', 'strong'
    }
  ],
  score: { type: Number, required: true },
  total: { type: Number, required: true }
});

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);
