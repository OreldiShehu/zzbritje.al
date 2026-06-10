const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  actorRole: { type: String },
  actorEmail: { type: String },
  action: { type: String, required: true },
  resource: { type: String, required: true },
  resourceId: { type: mongoose.Schema.Types.ObjectId },
  description: { type: String },
  previousData: { type: mongoose.Schema.Types.Mixed },
  newData: { type: mongoose.Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  method: { type: String, enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
  endpoint: { type: String },
  statusCode: { type: Number },
  duration: { type: Number },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  tags: [String],
}, { timestamps: true });

auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, resource: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ severity: 1 });
auditLogSchema.index({ ipAddress: 1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
