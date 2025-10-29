const User = require('../models/User');
const GameScore = require('../models/GameScore'); // must have a GameScore model for per-game leaderboards

// GET /api/leaderboard/global
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.getGlobalLeaderboard(10); // Top 10 by default
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

// GET /api/leaderboard/game/:gameId
exports.getGameLeaderboard = async (req, res) => {
  try {
    const { gameId } = req.params;
    if (!gameId) {
      return res.status(400).json({
        success: false,
        error: 'Missing gameId parameter'
      });
    }
    // This assumes there is a GameScore.getLeaderboard(gameId, limit) static method
    const leaderboard = await GameScore.getLeaderboard(gameId, 10); // Top 10 for this game
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching game leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
