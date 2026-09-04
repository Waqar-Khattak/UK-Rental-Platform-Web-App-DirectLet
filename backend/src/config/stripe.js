// Stripe Configuration
// Phase 4: Payment Integration

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = stripe;
