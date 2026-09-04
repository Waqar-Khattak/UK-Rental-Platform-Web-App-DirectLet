// Analytics Service - Business Logic Layer
// Phase 5: Landlord dashboard and analytics

const propertyRepository = require('../repositories/propertyRepository');
const messageRepository = require('../repositories/messageRepository');

class AnalyticsService {
  async getLandlordDashboardStats(landlordId) {
    const properties = await propertyRepository.findByLandlordId(landlordId);

    const stats = {
      totalProperties: properties.length,
      totalViews: properties.reduce((sum, p) => sum + p.viewCount, 0),
      totalMessages: 0, // TODO: Count messages
      activeListings: properties.filter(p => p.isActive).length,
    };

    return stats;
  }

  async getPropertyPerformance(propertyId) {
    const property = await propertyRepository.findById(propertyId);
    return {
      propertyId,
      views: property.viewCount,
      inquiries: 0, // TODO: Count inquiries
      scheduledViewings: 0, // TODO: Count viewings
    };
  }
}

module.exports = new AnalyticsService();
