# DirectLet Platform

**A rental platform connecting landlords and tenants directly, cutting out estate agents.**

## Project Overview

DirectLet is a full-stack web application built with MongoDB, React, and GraphQL. It covers the entire rental lifecycle in one place: property listings, messaging, viewing scheduling, payments, landlord analytics, and user verification.

### Tech Stack

- **Backend**: Node.js + Express + Apollo GraphQL
- **Database**: MongoDB
- **Frontend**: React + Apollo Client
- **Payments**: Stripe Connect
- **Maps**: Google Maps / OpenStreetMap (Phase 2)
- **Real-time**: WebSockets (Phase 3)

## Development Phases

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1** | Authentication, User roles, Database schema | Core Setup |
| **Phase 2** | Property listings, Search/filtering, Map integration | Properties |
| **Phase 3** | Real-time messaging, Viewing scheduling | Messaging |
| **Phase 4** | Stripe payments, Rent & deposit collection | Payments |
| **Phase 5** | Landlord analytics dashboard | Analytics |
| **Phase 6** | Identity verification, User trust system | Verification |

## Architecture

### Repository Pattern
- Business logic layer (Services) separated from database access (Repositories)
- `repositories/` - Database queries
- `services/` - Business logic
- `resolvers/` - GraphQL handlers

### User Roles
1. **Landlord** - Create listings, manage properties, receive payments, view analytics
2. **Tenant** - Browse properties, schedule viewings, send messages, pay rent/deposit
3. **Admin** - Manage users, verify identities, monitor platform

## Project Structure

```
directlet/
├── backend/
│   ├── src/
│   │   ├── config/         (Database & services config)
│   │   ├── models/         (Mongoose schemas)
│   │   ├── graphql/        (GraphQL types & resolvers)
│   │   ├── repositories/   (Data access layer)
│   │   ├── services/       (Business logic)
│   │   ├── middleware/     (Auth, logging, etc.)
│   │   ├── utils/          (JWT, helpers)
│   │   └── server.js       (Entry point)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/          (React pages per phase)
│   │   ├── components/     (Reusable React components)
│   │   ├── context/        (Auth context)
│   │   ├── apollo/         (GraphQL client config)
│   │   └── App.jsx
│   └── package.json
└── tests/
    ├── functional/         (User workflow tests)
    ├── integration/        (Component integration tests)
    ├── usability/          (User testing & metrics)
    └── performance/        (Load & response time tests)
```

## Getting Started

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure MongoDB, JWT, Stripe keys in .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Key Features

### Phase 1: Authentication
- User registration (landlord/tenant/admin roles)
- Secure login with JWT
- Role-based access control

### Phase 2: Property Management
- Landlords create and manage listings
- Tenants search and filter properties
- Map view integration (Google Maps/OpenStreetMap)
- Property images and amenities

### Phase 3: Messaging & Viewing
- Real-time messaging between landlords and tenants
- Viewing appointment scheduling
- Notification system

### Phase 4: Payments
- Stripe Connect integration
- Rent payment collection
- Deposit management
- Payment history tracking

### Phase 5: Analytics
- Landlord dashboard with property performance stats
- View counts, inquiries, upcoming viewings
- Revenue tracking

### Phase 6: Verification
- Email, phone, and document verification
- Background checks (optional)
- Trust badge system

## Testing

Run tests for each category:
```bash
npm test -- functional
npm test -- integration
npm test -- usability
npm test -- performance
```

## Evaluation Metrics

- **Response Time**: < 200ms
- **Page Load Time**: < 2s
- **Task Completion Rate**: > 90%
- **User Satisfaction (SUS)**: > 70

## Research Project

This project is developed using **Design Science Research (DSR)** methodology, with phases tracked in Agile/Scrum sprints. All development, testing, and evaluation is documented for academic submission.

## Team

- **Solo Project**: Full-stack development, testing, and research

## Notes

- Synthetic test data is generated using Faker.js
- Ethics approval required before user testing
- All endpoints require JWT authentication (except login/register)

