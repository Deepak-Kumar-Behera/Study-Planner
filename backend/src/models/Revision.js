const mongoose = require('mongoose');

const revisionTopicSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  type: { type: String, required: true },
  topic: { type: String, required: true },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' }
}, { timestamps: true });

revisionTopicSchema.set('timestamps', {
  currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000)
});

module.exports = mongoose.model('Revision', revisionTopicSchema);