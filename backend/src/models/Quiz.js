const mongoose = require('mongoose');


const quizQuestionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true }, // Array of 4 options
  answer: { type: String, required: true } // Correct option
}, { timestamps: true });

quizQuestionSchema.set('timestamps', {
  currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000)
});

module.exports = mongoose.model('Quiz', quizQuestionSchema);