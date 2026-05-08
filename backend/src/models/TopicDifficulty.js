const mongoose = require('mongoose');

/**
 * Tracks the auto-adjusted quiz difficulty per user per topic (inputId).
 * difficulty is recalculated after every quiz submission based on recent scores.
 *
 * Scoring thresholds (based on last 3 submissions for the topic):
 *   avg score >= 75%  → hard
 *   avg score >= 40%  → medium
 *   avg score <  40%  → easy
 */
const topicDifficultySchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User',  required: true },
  inputId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  updatedAt:  { type: Date, default: Date.now },
});

topicDifficultySchema.index({ userId: 1, inputId: 1 }, { unique: true });

module.exports = mongoose.model('TopicDifficulty', topicDifficultySchema);
