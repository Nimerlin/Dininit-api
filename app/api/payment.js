const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const username = 'Nitin';
// const password = process.env.DB_PASSWORD;
const password = "Nitin@2025";
const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@dinenit.cqxiskh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Process a payment
 *     description: Registers a new payment in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payment_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *               status:
 *                 type: string
 *               amount:
 *                 type: number
 *               created_at:
 *                 type: string
 *                 format: date-time
 *               subscribed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Payment Registered Successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Duplicate Payment
 *       500:
 *         description: Internal server error
 */

// Payment API Endpoint
router.post('/payment', async (req, res) => {
    try {
        // 1. Validate the request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Invalid Request',
                message: 'Request body is empty'
            });
        }
       
        const { payment_id, user_id, status, amount, created_at, subscribed } = req.body;
        console.log(req.body);
        // 2. Input validation with specific error messages
        const requiredFields = {
            payment_id: 'Payment ID is required',
            user_id: 'User ID is required',
            status: 'Status is required',
            amount: 'Amount is required',
            created_at: 'Created date is required',
            subscribed: 'Subscription status is required'
        };

        for (const [field, message] of Object.entries(requiredFields)) {
            if (!req.body.hasOwnProperty(field)) {
                return res.status(400).json({
                    error: 'Validation Error',
                    field,
                    message
                });
            }
        }

        // 3. Additional validation for amount and subscribed
        if (typeof amount !== 'number' || amount <= 0) {
            return res.status(400).json({
                error: 'Validation Error',
                field: 'amount',
                message: 'Amount must be a positive number'
            });
        }

        // 4. Connect to MongoDB
        await client.connect();
        const database = client.db('dininit_monitoring');
        const payment_status = database.collection('payment_status');

        // 5. Check for duplicate payment_id
        const existingPayment = await payment_status.findOne({ payment_id });
        if (existingPayment) {
            return res.status(409).json({
                error: 'Duplicate Payment',
                message: `Payment with ID ${payment_id} already exists`,
                payment_id
            });
        }

        // 6. Insert the new payment record
        const paymentData = {
            payment_id,
            user_id,
            status,
            amount,
            created_at: new Date(created_at),
            subscribed
        };

        const result = await payment_status.insertOne(paymentData);
        if (!result.acknowledged) {
            throw new Error('Failed to insert payment record');
        }

        // 7. Respond with success
        res.status(201).json({
            message: 'Payment Registered Successfully',
            payment_id,
            inserted_id: result.insertedId
        });

    } catch (error) {
        // Enhanced error logging
        console.error('Payment error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // MongoDB specific errors
        if (error.name === 'MongoServerError') {
            return res.status(503).json({
                error: 'Database Error',
                message: 'Unable to process payment at this time',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Syntax errors in request body
        if (error instanceof SyntaxError) {
            return res.status(400).json({
                error: 'Invalid JSON',
                message: 'The request body contains invalid JSON',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // MongoDB connection errors
        if (error.name === 'MongoNetworkError') {
            return res.status(503).json({
                error: 'Connection Error',
                message: 'Unable to connect to the database',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }

        // Generic error response
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'An unexpected error occurred while processing the payment',
            errorType: error.name,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    } finally {
        // Ensure the database connection is closed
        try {
            await client.close();
        } catch (error) {
            console.error('Error closing database connection:', error);
        }
    }
});

module.exports = router;
