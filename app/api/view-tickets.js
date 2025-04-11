const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const username = 'Nitin';
const password = process.env.DB_PASSWORD;
const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@dinenit.cqxiskh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

/**
 * @swagger
 * /api/view-tickets:
 *   get:
 *     summary: Retrieve all tickets
 *     description: Fetches all ticket records from the database.
 *     responses:
 *       200:
 *         description: Successfully retrieved tickets
 *       500:
 *         description: Failed to retrieve tickets
 */

// Tickets API Endpoint
router.get('/view-tickets', async (req, res) => {
    try {
        // Connect to MongoDB
        await client.connect();
        const database = client.db('dininit_monitoring');
        const ticketsCollection = database.collection('ticket_details');

        // Retrieve all tickets
        const tickets = await ticketsCollection.find({}).toArray();

        // Respond with the list of tickets
        res.status(200).json({
            message: 'Tickets retrieved successfully',
            tickets
        });

    } catch (error) {
        // Enhanced error logging
        console.error('Error retrieving tickets:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // MongoDB specific errors
        if (error.name === 'MongoServerError') {
            return res.status(503).json({
                error: 'Database Error',
                message: 'Unable to retrieve tickets at this time',
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
            message: 'An unexpected error occurred while retrieving tickets',
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
