// Verification Model - User Identity & Trust System
// Phase 6: Verification & Trust

const mongoose = require('mongoose');

const VerificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['email', 'phone', 'document', 'background_check'], required: true },
    status: { type: String, enum: ['pending', 'verified', 'failed'], default: 'pending' },
    documentUrl: String,
    verificationDate: Date,
    expiryDate: Date,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Verification', VerificationSchema);
