const express = require('express');
const { verifyWalletAuth, verifyWalletToken, verifyApiKey, validateScore } = require('../middleware/auth');
const {
  submitScore,
  getUserProfile,
  updateUserProfile
} = require('../controllers/scoreController');
const {createGame} = require('../controllers/adminGameController');
const { db } = require('../config/firebase');
const { createTournament, getAllTournaments, getTournamentById } = require('../controllers/tournamentController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Get recent community activities
router.get('/community/recent-activity', async (req, res) => {
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

// Get recent games
router.get('/games', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }

    const activitiesRef = db.collection('games');
    const q = activitiesRef.limit(5);
    const querySnapshot = await q.get();

    const games = [];
    querySnapshot.forEach((doc) => {
      games.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json({
      success: true,
      data: games
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error - games'
    });
  }
});

/*
* // Games
* <// Under development>
* // POST - Create a game
*/
router.post('/games',createGame);



// </Under development>


/*
* // Tournaments
* <// Under development>
* //
*/
router.post('/tournaments',createTournament);
router.get('/tournaments',getAllTournaments);
router.get('/tournaments/:tournamentId',getTournamentById);

// </Under development>


// Test endpoint to verify wallet token
router.get('/test-wallet', async (req, res) => {
  const { verifyWalletToken } = require('../config/walletAuth');
  try {
    // For testing, expect token in query param ?token=...
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: 'Missing token query parameter' });
    }
    const payload = verifyWalletToken(token);
    if (payload) {
      res.json({ message: 'Token verified successfully', payload });
    } else {
      res.status(400).json({ error: 'Token verification failed' });
    }
  } catch (error) {
    res.status(400).json({ error: 'Token verification failed', details: error.message });
  }
});

// Protected routes (require authentication)
router.get('/users/:userId', verifyWalletAuth, getUserProfile);
router.put('/users/:userId', verifyWalletAuth, updateUserProfile);
router.post('/submit-score', verifyWalletToken, verifyApiKey, validateScore, submitScore);

// Catch-all route for unmatched routes
router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
