// Property Model - Rental Listings
// Phase 2: Property Management

const mongoose = require('mongoose');

const PropertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    landlordId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    address: String,
    city: String,
    postcode: String,
    latitude: Number,
    longitude: Number,
    bedrooms: Number,
    bathrooms: Number,
    rent: Number,
    deposit: Number,
    images: [String],
    amenities: [String],
    availableFrom: Date,
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Property', PropertySchema);
