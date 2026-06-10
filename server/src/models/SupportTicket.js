const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  business: { type: mongoose.Schema.Types.ObjectId, ref: 'Business' },
  deal: { type: mongoose.Schema.Types.ObjectId, ref: 'Deal' },
  voucher: { type: mongoose.Schema.Types.ObjectId, ref: 'Voucher' },
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
  ticketNumber: { type: String, unique: true },
  subject: { type: String, required: true, maxlength: 200 },
  category: {
    type: String,
    enum: ['refund', 'redemption', 'technical', 'billing', 'account', 'business', 'other'],
    required: true,
  },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_user', 'waiting_business', 'resolved', 'closed'],
    default: 'open',
  },
  messages: [{
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['user', 'support', 'admin', 'business'] },
    message: { type: String, required: true, maxlength: 5000 },
    attachments: [{ url: String, name: String, type: String }],
    isInternal: { type: Boolean, default: false },
    sentAt: { type: Date, default: Date.now },
    readAt: { type: Date },
  }],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: { type: Date },
  closedAt: { type: Date },
  satisfactionRating: { type: Number, min: 1, max: 5 },
  satisfactionComment: { type: String },
  tags: [String],
  slaDeadline: { type: Date },
}, { timestamps: true });

supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ ticketNumber: 1 });
supportTicketSchema.index({ status: 1, priority: -1, createdAt: 1 });

supportTicketSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const year = new Date().getFullYear();
    this.ticketNumber = `TKT-${year}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
  }
  if (!this.slaDeadline) {
    const hours = { urgent: 4, high: 24, medium: 72, low: 168 };
    this.slaDeadline = new Date(Date.now() + (hours[this.priority] || 72) * 3600000);
  }
  next();
});

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
