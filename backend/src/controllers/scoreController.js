const User = require('../models/User');

exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user ? (req.user.walletAddress || req.user.id) : userId;

    if (req.user && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    let user = await User.getUserByWalletAddress(userId);
    if (!user) {
      user = await User.createUser(userId, { displayName: 'Anonymous Player' });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        displayName: user.displayName,
        totalPoints: user.totalPoints || 0,
        gamesPlayed: user.gamesPlayed || 0,
        createdAt: user.createdAt,
        lastActive: user.lastActive
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const requestingUserId = req.user ? (req.user.walletAddress || req.user.id) : userId;
    const { displayName } = req.body;

    if (req.user && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (!displayName || displayName.length < 3 || displayName.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Display name must be between 3 and 20 characters'
      });
    }

    let user = await User.getUserByWalletAddress(userId);
    if (!user) {
      user = await User.createUser(userId, { displayName });
    }

    const updatedUser = await User.updateProfile(userId, { displayName });

    res.status(200).json({
      success: true,
      data: {
        userId: updatedUser.id,
        displayName: updatedUser.displayName,
        totalPoints: updatedUser.totalPoints || 0,
        gamesPlayed: updatedUser.gamesPlayed || 0,
        createdAt: updatedUser.createdAt,
        lastActive: updatedUser.lastActive
      }
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({
        success: false,
        error: 'Database service not available'
      });
    }
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};
