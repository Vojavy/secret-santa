const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  notifications: [
    {
      type: { type: String, enum: ['invite', 'reminder', 'gift_received', 'service'], required: true },
      title: { type: String, required: true },
      data: { type: Object },
      read: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now }
    }
  ]
});

module.exports = mongoose.model('Notification', notificationSchema);
