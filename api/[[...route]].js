const express = require('express');
const cors = require('cors');
const { verifySolanaSignature, verifyApiKey, validateScore } = require('../backend/src/middleware/auth');
const { submitScore, getUserProfile, updateUserProfile, getGlobalLeaderboard, getGameLeaderboard } = require('../backend/src/controllers/scoreController');
const { db } = require('../backend/src/config/firebase'); // Explicitly import db

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (no authentication required)
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get recent community activities
app.get('/api/community/recent-activity', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }

    const activitiesRef = db.collection('communityActivities');
    const q = activitiesRef.orderBy('timestamp', 'desc').limit(20);
    const querySnapshot = await q.get();

    const activities = [];
    querySnapshot.forEach((doc) => {
      activities.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Error fetching community activities:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Protected routes (require authentication)
app.get('/api/users/:userId', getUserProfile);
app.put('/api/users/:userId', verifySolanaSignature, updateUserProfile);
app.post('/api/submit-score', verifySolanaSignature, verifyApiKey, validateScore, submitScore);
app.get('/api/leaderboard/global', getGlobalLeaderboard);
app.get('/api/leaderboard/:gameId', getGameLeaderboard);

// Catch-all route for unmatched routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Export the app as a Vercel function
module.exports = app;
