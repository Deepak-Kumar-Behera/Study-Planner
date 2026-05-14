const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: {
    currentTime: () => new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  }
});

module.exports = mongoose.model('User', userSchema);
