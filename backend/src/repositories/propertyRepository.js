// Property Repository - Database Access Layer (Repository Pattern)

const Property = require('../models/Property');

class PropertyRepository {
  async findById(id) {
    return await Property.findById(id);
  }

  async findByLandlordId(landlordId) {
    return await Property.find({ landlordId }).sort({ createdAt: -1 });
  }

  async findAll(skip = 0, limit = 10) {
    return await Property.find().skip(skip).limit(limit);
  }

  async findAllWithFilter(filter = {}, skip = 0, limit = 20) {
    return await Property.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
  }

  async create(propertyData) {
    const property = new Property(propertyData);
    return await property.save();
  }

  async update(id, data) {
    return await Property.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id) {
    return await Property.findByIdAndDelete(id);
  }

  async search(queryOrFilter) {
    const filter = typeof queryOrFilter === 'string'
      ? {
          $or: [
            { title: { $regex: queryOrFilter, $options: 'i' } },
            { city: { $regex: queryOrFilter, $options: 'i' } },
          ],
        }
      : queryOrFilter;

    return await Property.find(filter).sort({ createdAt: -1 });
  }

  async findByLandlordIdSorted(landlordId, limit = 5) {
    return await Property.find({ landlordId }).sort({ viewCount: -1 }).limit(limit);
  }
}

module.exports = new PropertyRepository();
