const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'Game', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  joinedAt: { type: Date, default: Date.now },
  isGifted: { type: Boolean, default: false }
});

module.exports = mongoose.model('Player', playerSchema);
