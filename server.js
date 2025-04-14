const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { MongoClient } = require('mongodb');
require('dotenv').config();

const app = express();
const router = express.Router();

// ===== MongoDB Atlas Connection =====
const username = 'Nitin';
const password = "Nitin@2025";
const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@dinenit.cqxiskh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect()
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

// ===== Middleware =====
app.use(cors());
app.options('*', cors());
app.use(express.json());

// ===== Swagger Setup =====
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "DinInit Monitoring API",
      version: "1.0.0",
      description: "API documentation for DinInit Monitoring API",
    },
    servers: [
      {
        url: "", // Leave empty for relative paths
      },
    ],
  },
  apis: ["./app/api/*.js", "./server.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve the raw Swagger JSON at /api/swagger.json
router.get('/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});

// Serve Swagger UI at /api/api-docs
router.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(undefined, {
    swaggerOptions: {
      url: "/api/swagger.json", // <- Correct path behind Ingress /api/
    },
  })
);

// ===== Import Routes =====
const signupRouter = require('./app/api/signup.js');
const loginRouter = require('./app/api/login.js');
const paymentRouter = require('./app/api/payment.js');
const verifyPaymentRouter = require('./app/api/verify-subscription.js');
const ticketRouter = require('./app/api/ticket.js');
const viewTicketsRouter = require('./app/api/view-tickets.js');

// ===== API Routing =====
router.use('/', signupRouter);
router.use('/', loginRouter);
router.use('/', paymentRouter);
router.use('/', verifyPaymentRouter);
router.use('/', ticketRouter);
router.use('/', viewTicketsRouter);

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message for DinInit Monitoring API
 *     responses:
 *       200:
 *         description: Returns a welcome message.
 */
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DinInit Monitoring API' });
});

// Mount everything under /api
app.use('/api', router);

// ===== Error Handler =====
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// ===== Start Server =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  // console.log(`📘 Swagger UI available at http://localhost:${PORT}/api/api-docs`);
});
