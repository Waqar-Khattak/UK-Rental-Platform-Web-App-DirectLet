// GraphQL Resolvers
// Complete resolvers for all DirectLet features

const userRepository = require('../repositories/userRepository');
const propertyRepository = require('../repositories/propertyRepository');
const messageRepository = require('../repositories/messageRepository');
const viewingRepository = require('../repositories/viewingRepository');
const paymentRepository = require('../repositories/paymentRepository');
const verificationRepository = require('../repositories/verificationRepository');
const messagingService = require('../services/messagingService');
const { generateToken } = require('../utils/jwt');
const stripe = require('../config/stripe');

const resolvers = {
  Query: {
    // Auth
    me: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await userRepository.findById(user.id);
    },

    // Properties
    properties: async (_, { skip = 0, limit = 20, city, minRent, maxRent, bedrooms }) => {
      const filter = { isActive: true };
      if (city) filter.city = { $regex: city, $options: 'i' };
      if (minRent || maxRent) {
        filter.rent = {};
        if (minRent) filter.rent.$gte = minRent;
        if (maxRent) filter.rent.$lte = maxRent;
      }
      if (bedrooms) filter.bedrooms = { $gte: bedrooms };
      return await propertyRepository.findAllWithFilter(filter, skip, limit);
    },

    property: async (_, { id }) => {
      const property = await propertyRepository.findById(id);
      if (property) {
        property.viewCount = (property.viewCount || 0) + 1;
        await property.save();
      }
      return property;
    },

    myProperties: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await propertyRepository.findByLandlordId(user.id);
    },

    searchProperties: async (_, { query, minRent, maxRent, bedrooms }) => {
      const filter = {
        isActive: true,
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { city: { $regex: query, $options: 'i' } },
          { address: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
        ],
      };
      if (minRent || maxRent) {
        filter.rent = {};
        if (minRent) filter.rent.$gte = minRent;
        if (maxRent) filter.rent.$lte = maxRent;
      }
      if (bedrooms) filter.bedrooms = { $gte: bedrooms };
      return await propertyRepository.search(filter);
    },

    // Messages
    messages: async (_, { userId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await messageRepository.findConversation(user.id, userId);
    },

    conversations: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const messages = await messageRepository.findByUser(user.id);

      const conversationMap = new Map();
      for (const msg of messages) {
        const otherId = msg.senderId.toString() === user.id ? msg.receiverId.toString() : msg.senderId.toString();
        if (!conversationMap.has(otherId)) {
          const unreadCount = await messageRepository.countUnreadForConversation(otherId, user.id);
          conversationMap.set(otherId, { userId: otherId, lastMessage: msg, unreadCount });
        }
      }

      const conversations = [];
      for (const [userId, data] of conversationMap) {
        const otherUser = await userRepository.findById(userId);
        if (otherUser) {
          conversations.push({ user: otherUser, lastMessage: data.lastMessage, unreadCount: data.unreadCount });
        }
      }
      return conversations;
    },

    messageContacts: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');

      /*
        Production rule:
        - Tenant should see landlords attached to available properties.
        - Landlord should see tenants who submitted enquiries or bookings.
        - Never expose all users without an authorization rule.
      */

      const allowedRole =
        user.role === 'LANDLORD' || user.role === 'landlord'
          ? 'TENANT'
          : 'LANDLORD';

      return await userRepository.findContactCandidates(user.id, allowedRole);
    },

    // Viewings
    myViewings: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const filter = user.role === 'landlord' ? { landlordId: user.id } : { tenantId: user.id };
      return await viewingRepository.findMany(filter, { scheduledDate: -1 });
    },

    propertyViewings: async (_, { propertyId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await viewingRepository.findMany({ propertyId }, { scheduledDate: -1 });
    },

    // Payments
    myPayments: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await paymentRepository.findByTenantId(user.id);
    },

    propertyPayments: async (_, { propertyId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await paymentRepository.findByPropertyId(propertyId);
    },

    // Analytics
    dashboardStats: async (_, __, { user }) => {
      if (!user || user.role !== 'landlord') throw new Error('Unauthorized');
      const properties = await propertyRepository.findByLandlordId(user.id);
      const propertyIds = properties.map(p => p._id);
      const totalViews = properties.reduce((sum, p) => sum + (p.viewCount || 0), 0);
      const totalMessages = await messageRepository.countByUser(user.id);
      const totalViewings = await viewingRepository.count({ landlordId: user.id });
      const payments = await paymentRepository.findCompletedByPropertyIds(propertyIds);
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalInquiries = await messageRepository.countByPropertyIds(propertyIds);
      const totalRentPayments = payments.filter(p => p.type === 'rent').reduce((sum, p) => sum + p.amount, 0);
      const totalDepositPayments = payments.filter(p => p.type === 'deposit').reduce((sum, p) => sum + p.amount, 0);
      const averageRent = properties.length ? properties.reduce((sum, p) => sum + (p.rent || 0), 0) / properties.length : 0;
      const averageViews = properties.length ? totalViews / properties.length : 0;

      return {
        totalProperties: properties.length,
        totalViews,
        totalMessages,
        activeListings: properties.filter(p => p.isActive).length,
        totalViewings,
        totalPayments,
        averageRent,
        averageViews,
        totalInquiries,
        totalRentPayments,
        totalDepositPayments,
      };
    },

    topProperties: async (_, { limit = 5 }, { user }) => {
      if (!user || user.role !== 'landlord') throw new Error('Unauthorized');
      const properties = await propertyRepository.findByLandlordIdSorted(user.id, limit);
      return await Promise.all(properties.map(async (property) => {
        const inquiries = await messageRepository.countByPropertyId(property._id);
        const scheduledViewings = await viewingRepository.count({ propertyId: property._id });
        return {
          property,
          views: property.viewCount || 0,
          inquiries,
          scheduledViewings,
        };
      }));
    },

    propertyPerformance: async (_, { propertyId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const property = await propertyRepository.findById(propertyId);
      if (!property) throw new Error('Property not found');
      const inquiries = await messageRepository.countByPropertyId(propertyId);
      const scheduledViewings = await viewingRepository.count({ propertyId });
      return { property, views: property.viewCount || 0, inquiries, scheduledViewings };
    },

    // Verification
    myVerifications: async (_, __, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await verificationRepository.findByUserId(user.id);
    },

    // Admin
    allUsers: async (_, { role }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Unauthorized');
      const filter = role ? { role } : {};
      return await userRepository.findByRoleFilter(filter, role);
    },

    allVerifications: async (_, { status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Unauthorized');
      const filter = status ? { status } : {};
      return await verificationRepository.findMany(filter);
    },
  },

  Mutation: {
    // Auth
    register: async (_, { email, password, firstName, lastName, role }) => {
      const existing = await userRepository.findByEmail(email);
      if (existing) throw new Error('Email already registered');
      const user = await userRepository.create({ email, password, firstName, lastName, role });
      const token = generateToken(user._id);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await userRepository.findByEmail(email);
      if (!user || !(await user.comparePassword(password))) {
        throw new Error('Invalid credentials');
      }
      const token = generateToken(user._id);
      return { token, user };
    },

    updateProfile: async (_, args, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await userRepository.update(user.id, args);
    },

    // Properties
    createProperty: async (_, args, { user }) => {
      if (!user || user.role !== 'landlord') throw new Error('Only landlords can create properties');
      return await propertyRepository.create({ ...args, landlordId: user.id });
    },

    updateProperty: async (_, { id, ...updates }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const property = await propertyRepository.findById(id);
      if (!property) throw new Error('Property not found');
      if (property.landlordId.toString() !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to update this property');
      }
      return await propertyRepository.update(id, updates);
    },

    deleteProperty: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const property = await propertyRepository.findById(id);
      if (!property) throw new Error('Property not found');
      if (property.landlordId.toString() !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized to delete this property');
      }
      await propertyRepository.delete(id);
      return true;
    },

    // Messages
    sendMessage: async (_, { receiverId, content, propertyId }, { user, io }) => {
      if (!user) {
        throw new Error('Authentication required');
      }

      const cleanContent = content.trim();

      if (!cleanContent) {
        throw new Error('Message cannot be empty');
      }

      if (String(user.id) === String(receiverId)) {
        throw new Error('You cannot message yourself');
      }

      const receiver = await userRepository.findById(receiverId);

      if (!receiver) {
        throw new Error('Recipient not found');
      }

      const message = await messagingService.sendMessage(user.id, receiverId, cleanContent, propertyId);

      /*
        Emit to the receiver's socket room using context.io
        Use the same room name your socket join handler uses.
      */
      if (io) {
        io.to(String(receiverId)).emit('newMessage', message);
      }

      return message;
    },

    markMessageRead: async (_, { id }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await messageRepository.markAsRead(id);
    },

    // Viewings
    scheduleViewing: async (_, { propertyId, scheduledDate, notes }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const property = await propertyRepository.findById(propertyId);
      if (!property) throw new Error('Property not found');
      return await viewingRepository.create({
        propertyId,
        tenantId: user.id,
        landlordId: property.landlordId,
        scheduledDate: new Date(scheduledDate),
        notes,
      });
    },

    updateViewingStatus: async (_, { id, status }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      const viewing = await viewingRepository.findById(id);
      if (!viewing) throw new Error('Viewing not found');
      if (viewing.landlordId.toString() !== user.id && user.role !== 'admin') {
        throw new Error('Not authorized');
      }
      return await viewingRepository.update(id, { status });
    },

    // Payments
    createPaymentIntent: async (_, { amount, propertyId, type }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      try {
        const intent = await stripe.paymentIntents.create({
          amount: amount * 100,
          currency: 'gbp',
          metadata: { tenantId: user.id, propertyId, type },
        });
        const payment = await paymentRepository.create({
          tenantId: user.id,
          propertyId,
          amount,
          type,
          stripePaymentId: intent.id,
          status: 'pending',
        });
        return { clientSecret: intent.client_secret, paymentId: payment._id };
      } catch (error) {
        throw new Error(`Payment failed: ${error.message}`);
      }
    },

    confirmPayment: async (_, { paymentId }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await paymentRepository.update(paymentId, { status: 'completed' });
    },

    // Verification
    submitVerification: async (_, { type, documentUrl }, { user }) => {
      if (!user) throw new Error('Unauthorized');
      return await verificationRepository.create({ userId: user.id, type, documentUrl, status: 'pending' });
    },

    updateVerificationStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'admin') throw new Error('Unauthorized');
      const verification = await verificationRepository.update(id, { status, verificationDate: status === 'verified' ? new Date() : null });
      if (status === 'verified') {
        await userRepository.update(verification.userId, { isVerified: true });
      }
      return verification;
    },
  },

  // Field resolvers
  Property: {
    landlord: async (property) => await userRepository.findById(property.landlordId),
  },
  Message: {
    sender: async (message) => await userRepository.findById(message.senderId),
    receiver: async (message) => await userRepository.findById(message.receiverId),
  },
  Viewing: {
    property: async (viewing) => await propertyRepository.findById(viewing.propertyId),
    tenant: async (viewing) => await userRepository.findById(viewing.tenantId),
    landlord: async (viewing) => await userRepository.findById(viewing.landlordId),
  },
  Payment: {
    property: async (payment) => await propertyRepository.findById(payment.propertyId),
  },
};

module.exports = resolvers;
