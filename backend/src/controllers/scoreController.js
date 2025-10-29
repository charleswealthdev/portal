const User = require('../models/User');
const Game = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const { db, admin } = require('../config/firebase');

async function submitScore(req, res) {
  try {
    // Extract data from request
    const { gameId, score, userData } = req.body;
    // Extract userId from wallet token payload
    const userId = req.user.walletAddress || req.user.id;

    // Get user data
    let user = await User.getUserByWalletAddress(userId);
    if (!user) {
      // Create user if not found, using provided userData or default
      user = await User.createUser(userId, userData || {});
    }

    // Get game data
    const game = await Game.getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Prepare user data for leaderboard entry
    const userDataForLeaderboard = {
      displayName: user.displayName || 'Anonymous Player',
      photoURL: user.photoURL || null
    };

    // Update game-specific leaderboard
    await Leaderboard.updateGameLeaderboard(gameId, userId, score, userDataForLeaderboard);

    // Update user's total points and games played using a transaction
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      transaction.update(userRef, {
        totalPoints: admin.firestore.FieldValue.increment(score),
        gamesPlayed: admin.firestore.FieldValue.increment(1),
        lastActive: new Date()
      });
    });

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Score submitted successfully',
      data: {
        gameId,
        userId,
        score
      }
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({ error: 'Database service not available' });
    }

    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    // Extract requesting user ID from wallet token payload (if authenticated)
    const requestingUserId = req.user ? (req.user.walletAddress || req.user.id) : userId;

    // Check if user is requesting their own data (skip if not authenticated)
    if (req.user && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get user data
    let user = await User.getUserByWalletAddress(userId);
    if (!user) {
      // Create user if not found
      user = await User.createUser(userId, { displayName: 'Anonymous Player' });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Return user data
    res.status(200).json({
      success: true,
      data: {
        userId: user.id,
        displayName: user.displayName || 'Anonymous Player',
        totalPoints: user.totalPoints || 0,
        gamesPlayed: user.gamesPlayed || 0,
        createdAt: user.createdAt,
        lastActive: user.lastActive
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

    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function updateUserProfile(req, res) {
  try {
    const { userId } = req.params;
    // Extract requesting user ID from wallet token payload (if authenticated)
    const requestingUserId = req.user ? (req.user.walletAddress || req.user.id) : userId;
    const { displayName } = req.body;

    // Check if user is updating their own data (skip if not authenticated)
    if (req.user && userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Validate input
    if (!displayName || displayName.length < 3 || displayName.length > 20) {
      return res.status(400).json({
        success: false,
        error: 'Display name must be between 3 and 20 characters'
      });
    }

    // Check if user exists, create if not
    let user = await User.getUserByWalletAddress(userId);
    if (!user) {
      user = await User.createUser(userId, { displayName });
    }

    // Update user profile
    const updatedUser = await User.updateProfile(userId, { displayName });

    // Return updated user data
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
}



module.exports = {
  submitScore,
  getUserProfile,
  updateUserProfile
};
