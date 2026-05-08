const mongoose = require('mongoose');

const planStepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  type: { type: String, required: true },
  step: { type: String, required: true },
  details: { type: String }
}, { timestamps: true });

planStepSchema.set('timestamps', {
  currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000)
});

module.exports = mongoose.model('Plan', planStepSchema);