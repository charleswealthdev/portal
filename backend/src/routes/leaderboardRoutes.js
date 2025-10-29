const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');

router.get('/global', leaderboardController.getGlobalLeaderboard);
router.get('/game/:gameId', leaderboardController.getGameLeaderboard);

module.exports = router;
