const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['bug', 'idea', 'question', 'other'], required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  attachments: [
    {
      filename: { type: String },
      url: { type: String },
      base64_file: { type: String }
    }
  ],
  status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'low' },
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date },
  resolvedAt: { type: Date }
});

module.exports = mongoose.model('Ticket', ticketSchema);
