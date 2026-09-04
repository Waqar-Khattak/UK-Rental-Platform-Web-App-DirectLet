// Verification Repository - Database Access Layer

const Verification = require('../models/Verification');

class VerificationRepository {
  async findByUserId(userId) {
    return await Verification.find({ userId });
  }

  async findMany(filter = {}) {
    return await Verification.find(filter);
  }

  async create(data) {
    const verification = new Verification(data);
    return await verification.save();
  }

  async update(id, data) {
    return await Verification.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new VerificationRepository();
