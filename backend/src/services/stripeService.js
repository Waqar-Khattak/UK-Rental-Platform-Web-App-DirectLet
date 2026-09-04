// Stripe Service - Business Logic Layer
// Phase 4: Payment processing and Stripe integration

const stripe = require('../config/stripe');
const paymentRepository = require('../repositories/paymentRepository');

class StripeService {
  async createPaymentIntent(amount, tenantId, propertyId, type = 'rent') {
    try {
      const intent = await stripe.paymentIntents.create({
        amount: amount * 100, // Convert to cents
        currency: 'gbp',
        metadata: { tenantId, propertyId, type },
      });

      const payment = await paymentRepository.create({
        tenantId,
        propertyId,
        amount,
        type,
        stripePaymentId: intent.id,
      });

      return { intent, payment };
    } catch (error) {
      throw new Error(`Stripe error: ${error.message}`);
    }
  }

  async handlePaymentSuccess(stripePaymentId) {
    const payment = await paymentRepository.findByStripeId(stripePaymentId);
    if (payment) {
      await paymentRepository.update(payment._id, { status: 'completed' });
    }
    return payment;
  }
}

module.exports = new StripeService();
