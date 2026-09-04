// Entry point for DirectLet Backend
// Phase 1: Authentication & User Management

require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');
const connectDB = require('./config/db');
const { typeDefs, resolvers } = require('./graphql');
const authMiddleware = require('./middleware/auth');
const { initSocket } = require('./socket');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://192.168.18.33:3000',
  'http://192.168.10.49:3000',
  'http://localhost:5000',
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS origin not allowed: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(authMiddleware);

// Serve uploaded files
const path = require('path');
const uploadsPath = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Uploads route
const uploadsRouter = require('./routes/uploads');
app.use('/api/uploads', uploadsRouter);

// Apollo Server Setup
async function startServer() {
  await connectDB();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ user: req.user }),
  });

  await server.start();
  server.applyMiddleware({ app, cors: false }); // CORS already handled by Express

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`DirectLet Backend running at http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
