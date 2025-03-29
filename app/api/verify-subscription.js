const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = "mongodb://localhost:27017";
let client = null;

async function connectDB() {
    if (!client) {
        client = new MongoClient(uri);
        await client.connect();
    }
    return client;
}

/**
 * @swagger
 * /api/verify-subscription:
 *   post:
 *     summary: Verify user subscription status
 *     description: Checks if a user has an active subscription.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subscription status retrieved
 *       400:
 *         description: userId is required
 *       500:
 *         description: Failed to verify subscription
 */

router.post('/verify-subscription', async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        const client = await connectDB();
        const database = client.db('dininit_monitoring');
        const payment_status = database.collection('payment_status');

        const paymentStatus = await payment_status.findOne(
            { 
                user_id: userId,
                status: 'success' 
            }, 
            { 
                sort: { created_at: -1 }
            }
        );

        return res.json({
            subscribed: paymentStatus?.subscribed || 'no'
        });

    } catch (error) {
        console.error('Error verifying subscription:', error);
        
        if (error.name === 'MongoConnectionError') {
            return res.status(503).json({ error: 'Database connection error' });
        }
        
        return res.status(500).json({ 
            error: 'Failed to verify subscription' 
        });
    }
});

process.on('SIGINT', async () => {
    if (client) {
        await client.close();
        process.exit(0);
    }
});

module.exports = router;