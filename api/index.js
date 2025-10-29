const express = require('express');
const cors = require('cors');
const { verifyWalletToken, verifyApiKey, validateScore } = require('../backend/src/middleware/walletAuth');
const { submitScore, getUserProfile, updateUserProfile } = require('../backend/src/controllers/scoreController');
const { getGlobalLeaderboard, getGameLeaderboard } = require('../backend/src/controllers/leaderboardController');

// Create an Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get recent community activities
app.get('/api/community/recent-activity', async (req, res) => {
  try {
    // Import Firebase dynamically
    const { db } = await import('../backend/src/config/firebase.js');

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

// Protected routes
app.get('/api/users/:userId', verifyWalletToken, getUserProfile);
app.put('/api/users/:userId', verifyWalletToken, updateUserProfile);
app.post('/api/submit-score', verifyWalletToken, verifyApiKey, validateScore, submitScore);
app.get('/api/leaderboard/global', getGlobalLeaderboard);
app.get('/api/leaderboard/:gameId', getGameLeaderboard);

// Simple API endpoint for Vercel
export default function handler(request, response) {
  response.setHeader('Content-Type', 'application/json');
  response.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'PlayRush API'
  });
}

// Export the app as a Vercel function
module.exports = app;
