// Viewing Repository - Database Access Layer

const Viewing = require('../models/Viewing');

class ViewingRepository {
  async findById(id) {
    return await Viewing.findById(id);
  }

  async findMany(filter = {}, sort = {}) {
    const query = Viewing.find(filter);
    return await (sort && Object.keys(sort).length ? query.sort(sort) : query);
  }

  async count(filter = {}) {
    return await Viewing.countDocuments(filter);
  }

  async create(viewingData) {
    const viewing = new Viewing(viewingData);
    return await viewing.save();
  }

  async update(id, data) {
    return await Viewing.findByIdAndUpdate(id, data, { new: true });
  }
}

module.exports = new ViewingRepository();
