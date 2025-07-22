const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['draft', 'active', 'ended'], default: 'draft' },
  creatorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startAt: { type: Date },
  endsAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  settings: {
    anonymous: { type: Boolean, default: true },
    maxParticipants: { type: Number, default: 20 },
    allowChat: { type: Boolean, default: true },
    allowDirectChat: { type: Boolean, default: true }
  }
});

module.exports = mongoose.model('Game', gameSchema);
