const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  login: { type: String, required: true },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'regular'], default: 'regular' },
  isActive: { type: Boolean, default: true },
  isOnline: { type: Boolean, default: false },
  authProviders: [
    {
      provider: { type: String, required: true },
      providerId: { type: String, required: true }
    }
  ],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
