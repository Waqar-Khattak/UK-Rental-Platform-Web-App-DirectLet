// Faker Seed Generator - Synthetic Test Data
// Generates realistic UK rental market data for testing

const { faker } = require('@faker-js/faker');
const User = require('../models/User');
const Property = require('../models/Property');
const Message = require('../models/Message');
const Viewing = require('../models/Viewing');

const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Bristol', 'Liverpool', 'Edinburgh', 'Glasgow', 'Sheffield', 'Nottingham'];
const AMENITIES = ['WiFi', 'Parking', 'Garden', 'Dishwasher', 'Washing Machine', 'Central Heating', 'Double Glazing', 'Furnished', 'Pet Friendly', 'Balcony', 'Gym Access', 'Storage'];
const PROPERTY_TYPES = ['Modern Studio Apartment', 'Spacious 2-Bed Flat', 'Cosy Terraced House', 'Luxury Penthouse Suite', 'Victorian Conversion', 'New Build Apartment', 'Detached Family Home', 'Charming Cottage', 'City Centre Flat', 'Riverside Apartment'];

const generateSyntheticData = async (count = 15) => {
  try {
    console.log('Generating synthetic data...');

    // Generate landlords
    const landlords = [];
    for (let i = 0; i < Math.ceil(count / 3); i++) {
      const user = new User({
        email: faker.internet.email().toLowerCase(),
        password: 'Test@1234',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'landlord',
        phone: faker.phone.number('+44 7### ### ###'),
        isVerified: faker.datatype.boolean(0.7),
      });
      landlords.push(await user.save());
    }
    console.log(`Created ${landlords.length} landlords`);

    // Generate tenants
    const tenants = [];
    for (let i = 0; i < Math.ceil(count / 2); i++) {
      const user = new User({
        email: faker.internet.email().toLowerCase(),
        password: 'Test@1234',
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        role: 'tenant',
        phone: faker.phone.number('+44 7### ### ###'),
        isVerified: faker.datatype.boolean(0.5),
      });
      tenants.push(await user.save());
    }
    console.log(`Created ${tenants.length} tenants`);

    // Generate properties
    const properties = [];
    for (let i = 0; i < count; i++) {
      const city = UK_CITIES[Math.floor(Math.random() * UK_CITIES.length)];
      const bedrooms = faker.number.int({ min: 1, max: 5 });
      const baseRent = bedrooms * 400 + faker.number.int({ min: 100, max: 500 });

      const property = new Property({
        title: `${PROPERTY_TYPES[i % PROPERTY_TYPES.length]} in ${city}`,
        description: faker.lorem.paragraphs(2),
        landlordId: landlords[i % landlords.length]._id,
        address: faker.location.streetAddress(),
        city,
        postcode: faker.location.zipCode('??# #??').toUpperCase(),
        latitude: parseFloat(faker.location.latitude({ min: 51.3, max: 53.5 })),
        longitude: parseFloat(faker.location.longitude({ min: -2.5, max: 0.1 })),
        bedrooms,
        bathrooms: faker.number.int({ min: 1, max: Math.min(bedrooms, 3) }),
        rent: Math.round(baseRent / 50) * 50,
        deposit: Math.round(baseRent * 1.5 / 50) * 50,
        images: [`https://picsum.photos/seed/${faker.string.alphanumeric(8)}/800/500`],
        amenities: faker.helpers.arrayElements(AMENITIES, faker.number.int({ min: 3, max: 7 })),
        availableFrom: faker.date.future(),
        isActive: true,
        viewCount: faker.number.int({ min: 5, max: 150 }),
      });
      properties.push(await property.save());
    }
    console.log(`Created ${properties.length} properties`);

    // Generate some messages between tenants and landlords
    for (let i = 0; i < Math.ceil(count / 2); i++) {
      const tenant = tenants[i % tenants.length];
      const property = properties[i % properties.length];
      const landlord = landlords.find(l => l._id.toString() === property.landlordId.toString());
      if (!landlord) continue;

      await new Message({
        senderId: tenant._id,
        receiverId: landlord._id,
        propertyId: property._id,
        content: `Hi, I'm interested in "${property.title}". Is it still available?`,
      }).save();

      await new Message({
        senderId: landlord._id,
        receiverId: tenant._id,
        propertyId: property._id,
        content: `Yes, it's still available! Would you like to schedule a viewing?`,
      }).save();
    }
    console.log(`Created sample messages`);

    // Generate some viewings
    for (let i = 0; i < Math.ceil(count / 3); i++) {
      const tenant = tenants[i % tenants.length];
      const property = properties[i % properties.length];
      const landlord = landlords.find(l => l._id.toString() === property.landlordId.toString());
      if (!landlord) continue;

      await new Viewing({
        propertyId: property._id,
        tenantId: tenant._id,
        landlordId: landlord._id,
        scheduledDate: faker.date.future(),
        status: faker.helpers.arrayElement(['pending', 'confirmed']),
        notes: 'Looking forward to viewing the property',
      }).save();
    }
    console.log(`Created sample viewings`);

    console.log('\n✓ Synthetic data generation complete!');
    console.log(`  Landlords: ${landlords.length}`);
    console.log(`  Tenants: ${tenants.length}`);
    console.log(`  Properties: ${properties.length}`);
    console.log('\n  Test credentials: any generated email / Test@1234');
  } catch (error) {
    console.error('Error generating synthetic data:', error);
  }
};

// Allow running directly: node utils/faker-seed.js
if (require.main === module) {
  require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
  const connectDB = require('../config/db');
  connectDB().then(() => generateSyntheticData(15).then(() => process.exit(0)));
}

module.exports = generateSyntheticData;
