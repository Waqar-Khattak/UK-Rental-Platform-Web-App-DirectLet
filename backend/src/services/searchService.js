// Search Service - Business Logic Layer
// Phase 2: Property search and filtering

const propertyRepository = require('../repositories/propertyRepository');

class SearchService {
  async searchProperties(query, filters = {}) {
    let results = await propertyRepository.search(query);

    // Apply filters
    if (filters.minRent) {
      results = results.filter(p => p.rent >= filters.minRent);
    }
    if (filters.maxRent) {
      results = results.filter(p => p.rent <= filters.maxRent);
    }
    if (filters.bedrooms) {
      results = results.filter(p => p.bedrooms >= filters.bedrooms);
    }

    return results;
  }

  async getPropertiesNearby(latitude, longitude, radius = 5) {
    // Phase 2: Implement geospatial search
    const properties = await propertyRepository.findAll();
    return properties; // Placeholder
  }
}

module.exports = new SearchService();
