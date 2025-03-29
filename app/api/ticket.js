const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

/**
 * @swagger
 * /api/ticket:
 *   post:
 *     summary: Submit a new support ticket
 *     description: Creates a new ticket in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               priority:
 *                 type: string
 *               attachment:
 *                 type: string
 *               ticket_number:
 *                 type: string
 *               user:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ticket submitted successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Internal server error
 */

// Ticket API Endpoint
router.post('/ticket', async (req, res) => {
    try {
        // 1. Validate the request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                error: 'Invalid Request',
                message: 'Request body is empty'
            });
        }

        const { title, description, category, priority, attachment, ticket_number, user } = req.body;

        // 2. Input validation with specific error messages
        const requiredFields = {
            title: 'Ticket title is required',
            description: 'Description is required',
            category: 'Category is required',
            priority: 'Priority is required',
            ticket_number: 'Ticket number is required',
            user: 'User is required'
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

        // 3. Connect to MongoDB
        await client.connect();
        const database = client.db('dininit_monitoring'); 
        const ticketsCollection = database.collection('ticket_details'); // Replace with your collection name

        // 4. Check for duplicate ticket title (optional)
        const existingTicket = await ticketsCollection.findOne({ title });
        if (existingTicket) {
            return res.status(409).json({
                error: 'Duplicate Ticket',
                message: `Ticket with title "${title}" already exists`,
                title
            });
        }

        // 5. Insert the new ticket record
        const ticketData = {
            title,
            description,
            category,
            priority,
            attachment,
            ticket_number,
            user,
            created_at: new Date() 
        };

        const result = await ticketsCollection.insertOne(ticketData);
        if (!result.acknowledged) {
            throw new Error('Failed to insert ticket record');
        }

        // 6. Respond with success
        res.status(201).json({
            message: 'Ticket Submitted Successfully',
            ticket_id: result.insertedId
        });

    } catch (error) {
        // Enhanced error logging
        console.error('Ticket submission error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack,
            code: error.code
        });

        // MongoDB specific errors
        if (error.name === 'MongoServerError') {
            return res.status(503).json({
                error: 'Database Error',
                message: 'Unable to process ticket submission at this time',
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
            message: 'An unexpected error occurred while processing the ticket submission',
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
