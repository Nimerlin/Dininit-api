// const express = require('express');
// const router = express.Router();
// const { MongoClient } = require('mongodb');

// const username = 'Nitin';
// const password = process.env.DB_PASSWORD;
// const encodedPassword = encodeURIComponent(password);
// const uri = `mongodb+srv://${username}:${encodedPassword}@dinenit.cqxiskh.mongodb.net/?retryWrites=true&w=majority`;

// const client = new MongoClient(uri);


// /**
//  * @swagger
//  * /api/verify-subscription:
//  *   post:
//  *     summary: Verify user subscription status
//  *     description: Checks if a user has an active subscription.
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Subscription status retrieved
//  *       400:
//  *         description: userId is required
//  *       500:
//  *         description: Failed to verify subscription
//  */

// router.post('/verify-subscription', async (req, res) => {
//     try {
//         const { userId } = req.body;
        
//         if (!userId) {
//             return res.status(400).json({ error: 'userId is required' });
//         }

//         const client = await connectDB();
//         const database = client.db('dininit_monitoring');
//         const payment_status = database.collection('payment_status');

//         const paymentStatus = await payment_status.findOne(
//             { 
//                 user_id: userId,
//                 status: 'success' 
//             }, 
//             { 
//                 sort: { created_at: -1 }
//             }
//         );

//         return res.json({
//             subscribed: paymentStatus?.subscribed || 'no'
//         });

//     } catch (error) {
//         console.error('Error verifying subscription:', error);
        
//         if (error.name === 'MongoConnectionError') {
//             return res.status(503).json({ error: 'Database connection error' });
//         }
        
//         return res.status(500).json({ 
//             error: 'Failed to verify subscription' 
//         });
//     }
// });

// process.on('SIGINT', async () => {
//     if (client) {
//         await client.close();
//         process.exit(0);
//     }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

// Environment + MongoDB setup
const username = 'Nitin';
const password = process.env.DB_PASSWORD;

if (!password) {
    console.error('❌ Environment variable DB_PASSWORD is not set.');
    process.exit(1);
}

const encodedPassword = encodeURIComponent(password);
const uri = `mongodb+srv://${username}:${encodedPassword}@dinenit.cqxiskh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useUnifiedTopology: true });

let isConnected = false;

// Helper function to ensure DB is connected
async function connectDB() {
    if (!isConnected) {
        try {
            await client.connect();
            isConnected = true;
            console.log('✅ Connected to MongoDB');
        } catch (err) {
            console.error('❌ MongoDB connection failed:', err);
            throw err;
        }
    }
    return client.db('dininit_monitoring');
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

        const db = await connectDB();
        const payment_status = db.collection('payment_status');

        const paymentStatus = await payment_status.findOne(
            { user_id: userId, status: 'success' },
            { sort: { created_at: -1 } }
        );

        return res.json({
            subscribed: paymentStatus?.subscribed || 'no'
        });

    } catch (error) {
        console.error('❌ Error verifying subscription:', error);

        return res.status(500).json({ 
            error: 'Internal Server Error',
            message: error.message || 'Unknown error'
        });
    }
});

// Debug route to test DB connection manually
router.get('/test-db', async (req, res) => {
    try {
        const db = await connectDB();
        const collections = await db.listCollections().toArray();
        res.json({ success: true, collections });
    } catch (error) {
        console.error('❌ DB connection test failed:', error);
        res.status(500).json({ error: 'DB connection test failed', message: error.message });
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await client.close();
        console.log('🛑 MongoDB connection closed.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error during MongoDB disconnect:', err);
        process.exit(1);
    }
});

module.exports = router;
