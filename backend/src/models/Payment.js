// Payment Model - Rent & Deposit Payments
// Phase 4: Payment Integration with Stripe

const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    propertyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['rent', 'deposit'], required: true },
    stripePaymentId: String,
    status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);
