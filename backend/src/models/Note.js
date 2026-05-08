const mongoose = require('mongoose');

const noteSectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inputId: { type: mongoose.Schema.Types.ObjectId, ref: 'Input', required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

noteSectionSchema.set('timestamps', {
  currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000)
});

module.exports = mongoose.model('Note', noteSectionSchema);