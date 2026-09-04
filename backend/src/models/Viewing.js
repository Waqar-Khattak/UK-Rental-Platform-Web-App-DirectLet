// Viewing Model - Appointment Scheduling
// Phase 3: Viewing Scheduling System

const mongoose = require('mongoose');

const ViewingSchema = new mongoose.Schema(
  {
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    scheduledDate: { type: Date, required: true },
    duration: { type: Number, default: 30 }, // minutes
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
    notes: String,
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Viewing', ViewingSchema);
