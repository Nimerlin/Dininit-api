// const express = require('express');
// const cors = require('cors');
// const swaggerJsdoc = require("swagger-jsdoc");
// const swaggerUi = require("swagger-ui-express");

// const app = express();

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Swagger configuration
// const swaggerOptions = {
//     definition: {
//         openapi: "3.0.0",
//         info: {
//             title: "DinInit Monitoring API",
//             version: "1.0.0",
//             description: "API documentation for DinInit Monitoring API",
//         },
//         servers: [
//             {
//                 url: "http://localhost:3001", // Change if needed
//             },
//         ],
//     },
//     apis: ["./app/api/*.js", "./server.js"], // Path to API docs
// };

// const swaggerDocs = swaggerJsdoc(swaggerOptions);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// // Import routes with correct path
// const signupRouter = require('./app/api/signup.js');  
// const loginRouter = require('./app/api/login.js');    
// const paymentRouter = require('./app/api/payment.js');
// const verifyPaymentRouter = require('./app/api/verify-subscription.js');
// const ticketRouter = require('./app/api/ticket.js');
// const viewTicketsRouter = require('./app/api/view-tickets.js');

// // Use routes
// app.use('/api', signupRouter);
// app.use('/api', loginRouter);
// app.use('/api', paymentRouter);
// app.use('/api', verifyPaymentRouter);
// app.use('/api', ticketRouter);
// app.use('/api', viewTicketsRouter);

// /**
//  * @swagger
//  * /:
//  *   get:
//  *     summary: Welcome message for DinInit Monitoring API
//  *     responses:
//  *       200:
//  *         description: Returns a welcome message.
//  */
// app.get('/', (req, res) => {
//     res.json({ message: 'Welcome to DinInit Monitoring API' });
// });

// // Error handling middleware
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).json({ error: 'Something broke!' });
// });

// const PORT = process.env.PORT || 3001;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
//     console.log(`Swagger docs available at http://localhost:${PORT}/api/api-docs`);
// });

const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
const router = express.Router();

// Middleware
app.use(cors()); // ✅ Default CORS (allow all)

// ✅ Extra headers to avoid Swagger CORS issues
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

app.use(express.json());

// ✅ Swagger configuration
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
        url: "/api", // ✅ RELATIVE path instead of http://localhost (fixes fetch in Kubernetes or reverse proxy)
      },
    ],
  },
  apis: ["./app/api/*.js", "./server.js"], // Swagger doc comments
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Import routes
const signupRouter = require('./app/api/signup.js');
const loginRouter = require('./app/api/login.js');
const paymentRouter = require('./app/api/payment.js');
const verifyPaymentRouter = require('./app/api/verify-subscription.js');
const ticketRouter = require('./app/api/ticket.js');
const viewTicketsRouter = require('./app/api/view-tickets.js');

// Use routes under /api
router.use('/', signupRouter);
router.use('/', loginRouter);
router.use('/', paymentRouter);
router.use('/', verifyPaymentRouter);
router.use('/', ticketRouter);
router.use('/', viewTicketsRouter);

/**
 * @swagger
 * /api:
 *   get:
 *     summary: Welcome message for DinInit Monitoring API
 *     responses:
 *       200:
 *         description: Returns a welcome message.
 */
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to DinInit Monitoring API' });
});

// Mount router at /api
app.use('/api', router);

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api/api-docs`);
});
