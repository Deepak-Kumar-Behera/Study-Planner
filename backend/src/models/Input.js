const mongoose = require('mongoose');

const inputSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  value: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Compound unique index: same user cannot have duplicate input values
inputSchema.index({ userId: 1, value: 1 }, { unique: true });

module.exports = mongoose.model('Input', inputSchema);