const express = require('express');
const { verifyPrivyToken, verifyApiKey, validateScore } = require('../middleware/auth');
const { 
  submitScore,
  getUserProfile,
  updateUserProfile,
  getGlobalLeaderboard,
  getGameLeaderboard
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


// Test endpoint to verify Privy client and token verification
router.get('/test-privy', async (req, res) => {
  const { privy } = require('../config/privy');
  if (!privy) {
    return res.status(500).json({ error: 'Privy client not initialized' });
  }
  try {
    // For testing, expect token in query param ?token=...
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ error: 'Missing token query parameter' });
    }
    const payload = await privy.verifyAuthToken(token);
    res.json({ message: 'Token verified successfully', payload });
  } catch (error) {
    res.status(400).json({ error: 'Token verification failed', details: error.message });
  }
});

// Protected routes (require authentication)
router.get('/users/:userId', getUserProfile);
router.put('/users/:userId', updateUserProfile);
router.post('/submit-score', verifyPrivyToken, verifyApiKey, validateScore, submitScore);
router.get('/leaderboard/global', getGlobalLeaderboard);
router.get('/leaderboard/:gameId', getGameLeaderboard);

// Catch-all route for unmatched routes
router.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

module.exports = router;
