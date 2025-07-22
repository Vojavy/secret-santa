const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  logType: { type: String, enum: ['GAME', 'CHAT', 'SYSTEM'], required: true },
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payload: {
    action: { type: String, enum: ['CREATE_GAME', 'JOIN_GAME', 'SEND_MESSAGE', 'UPDATED_GAME', 'PAIR_CREATED', 'DIRECT_MESSAGE_SENT', 'PLAYER_GIFTED', 'PLAYER_REMOVED', 'GAME_ENDED'], required: true },
    details: { type: Object }
  }
});

module.exports = mongoose.model('Log', logSchema);
