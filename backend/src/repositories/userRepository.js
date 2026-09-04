// User Repository - Database Access Layer (Repository Pattern)
// Separates database logic from business logic

const User = require('../models/User');

class UserRepository {
  async findById(id) {
    return await User.findById(id);
  }

  async findByEmail(email) {
    return await User.findOne({ email });
  }

  async create(userData) {
    const user = new User(userData);
    return await user.save();
  }

  async update(id, data) {
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await User.findByIdAndDelete(id);
  }

  async findByRole(role) {
    return await User.find({ role });
  }

  async findByRoleFilter(filter = {}, role) {
    const query = role ? { ...filter, role } : filter;
    return await User.find(query);
  }

  async findContactCandidates(currentUserId, allowedRole) {
    return await User.find({
      _id: { $ne: currentUserId },
      role: { $regex: `^${allowedRole}$`, $options: 'i' },
    })
      .select('_id firstName lastName role')
      .sort({ firstName: 1, lastName: 1 });
  }
}

module.exports = new UserRepository();
