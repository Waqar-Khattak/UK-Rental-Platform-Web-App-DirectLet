// GraphQL Type Definitions
// Complete schema for DirectLet Platform

const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    firstName: String!
    lastName: String!
    role: String!
    phone: String
    avatar: String
    isVerified: Boolean!
    createdAt: String
  }

  type Property {
    id: ID!
    title: String!
    description: String
    landlord: User
    landlordId: ID!
    address: String
    city: String
    postcode: String
    latitude: Float
    longitude: Float
    bedrooms: Int
    bathrooms: Int
    rent: Int
    deposit: Int
    images: [String]
    amenities: [String]
    availableFrom: String
    isActive: Boolean
    viewCount: Int
    createdAt: String
  }

  type Message {
    id: ID!
    senderId: ID!
    receiverId: ID!
    sender: User
    receiver: User
    propertyId: ID
    content: String!
    isRead: Boolean!
    createdAt: String!
  }

  type Conversation {
    user: User!
    lastMessage: Message
    unreadCount: Int!
  }

  type Viewing {
    id: ID!
    property: Property
    tenant: User
    landlord: User
    propertyId: ID!
    tenantId: ID!
    landlordId: ID!
    scheduledDate: String!
    duration: Int
    status: String!
    notes: String
    createdAt: String
  }

  type Payment {
    id: ID!
    tenantId: ID!
    propertyId: ID!
    property: Property
    amount: Int!
    type: String!
    status: String!
    stripePaymentId: String
    stripeClientSecret: String
    createdAt: String
  }

  type Verification {
    id: ID!
    userId: ID!
    type: String!
    status: String!
    documentUrl: String
    verificationDate: String
    expiryDate: String
    createdAt: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type DashboardStats {
    totalProperties: Int!
    totalViews: Int!
    totalMessages: Int!
    activeListings: Int!
    totalViewings: Int!
    totalPayments: Float!
    averageRent: Float!
    averageViews: Float!
    totalInquiries: Int!
    totalRentPayments: Float!
    totalDepositPayments: Float!
  }

  type PropertyPerformance {
    property: Property!
    views: Int!
    inquiries: Int!
    scheduledViewings: Int!
  }

  type PaymentIntent {
    clientSecret: String!
    paymentId: ID!
  }

  type Query {
    me: User
    properties(skip: Int, limit: Int, city: String, minRent: Int, maxRent: Int, bedrooms: Int): [Property]
    property(id: ID!): Property
    myProperties: [Property]
    searchProperties(query: String!, minRent: Int, maxRent: Int, bedrooms: Int): [Property]
    messages(userId: ID!): [Message]
    conversations: [Conversation]
    messageContacts: [User!]!
    myViewings: [Viewing]
    propertyViewings(propertyId: ID!): [Viewing]
    myPayments: [Payment]
    propertyPayments(propertyId: ID!): [Payment]
    dashboardStats: DashboardStats
    topProperties(limit: Int): [PropertyPerformance]
    propertyPerformance(propertyId: ID!): PropertyPerformance
    myVerifications: [Verification]
    allUsers(role: String): [User]
    allVerifications(status: String): [Verification]
  }

  type Mutation {
    register(email: String!, password: String!, firstName: String!, lastName: String!, role: String!): AuthPayload
    login(email: String!, password: String!): AuthPayload
    updateProfile(firstName: String, lastName: String, phone: String, avatar: String): User
    createProperty(title: String!, description: String, address: String, city: String, postcode: String, latitude: Float, longitude: Float, bedrooms: Int, bathrooms: Int, rent: Int!, deposit: Int, images: [String], amenities: [String], availableFrom: String): Property
    updateProperty(id: ID!, title: String, description: String, address: String, city: String, rent: Int, deposit: Int, bedrooms: Int, bathrooms: Int, images: [String], amenities: [String], isActive: Boolean): Property
    deleteProperty(id: ID!): Boolean
    sendMessage(receiverId: ID!, content: String!, propertyId: ID): Message
    markMessageRead(id: ID!): Message
    scheduleViewing(propertyId: ID!, scheduledDate: String!, notes: String): Viewing
    updateViewingStatus(id: ID!, status: String!): Viewing
    createPaymentIntent(amount: Int!, propertyId: ID!, type: String!): PaymentIntent
    confirmPayment(paymentId: ID!): Payment
    submitVerification(type: String!, documentUrl: String): Verification
    updateVerificationStatus(id: ID!, status: String!): Verification
  }
`;

module.exports = typeDefs;
