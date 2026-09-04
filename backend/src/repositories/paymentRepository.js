// Payment Repository - Database Access Layer (Repository Pattern)
// Phase 4: Payment processing

const Payment = require('../models/Payment');

class PaymentRepository {
  async findById(id) {
    return await Payment.findById(id);
  }

  async findByTenantId(tenantId) {
    return await Payment.find({ tenantId }).sort({ createdAt: -1 });
  }

  async findByPropertyId(propertyId) {
    return await Payment.find({ propertyId }).sort({ createdAt: -1 });
  }

  async findCompletedByPropertyIds(propertyIds) {
    return await Payment.find({ propertyId: { $in: propertyIds }, status: 'completed' });
  }

  async create(paymentData) {
    const payment = new Payment(paymentData);
    return await payment.save();
  }

  async update(id, data) {
    return await Payment.findByIdAndUpdate(id, data, { new: true });
  }

  async findByStripeId(stripeId) {
    return await Payment.findOne({ stripePaymentId: stripeId });
  }
}

module.exports = new PaymentRepository();
