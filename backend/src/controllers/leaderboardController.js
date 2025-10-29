const User = require('../models/User');

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.getGlobalLeaderboard(10); // Top 10 default
    res.status(200).json({
      success: true,
      data: leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
