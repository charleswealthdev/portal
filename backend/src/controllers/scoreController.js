const User = require('../models/User');
const Game = require('../models/Game');
const Leaderboard = require('../models/Leaderboard');
const { db, admin } = require('../config/firebase');

async function submitScore(req, res) {
  try {
    // Extract data from request
    const { gameId, score } = req.body;
    // Extract userId from signature verification middleware
    const userId = req.user.id;

    // Get user data
    let user = await User.getUserById(userId);
    if (!user) {
      // Create user if not found
      user = await User.createUser(userId);
    }

    // Get game data
    const game = await Game.getGameById(gameId);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Prepare user data for leaderboard entry
    const userDataForLeaderboard = {
      displayName: user.displayName || 'Anonymous Player',
      photoURL: user.photoURL || null // This field may be deprecated as we don't have user avatars
    };

    // Update game-specific leaderboard and get score difference
    const { scoreDifference } = await Leaderboard.updateGameLeaderboard(gameId, userId, score, userDataForLeaderboard);

    // Update user's total points and games played using a transaction
    await db.runTransaction(async (transaction) => {
      const userRef = db.collection('users').doc(userId);
      
      const updateData = {
        gamesPlayed: admin.firestore.FieldValue.increment(1),
        lastActive: new Date()
      };

      if (scoreDifference > 0) {
        updateData.totalPoints = admin.firestore.FieldValue.increment(scoreDifference);
      }

      transaction.update(userRef, updateData);
    });

    // If there was a new high score, create a community activity event
    if (scoreDifference > 0) {
      const activityRef = db.collection('communityActivities').doc();
      await activityRef.set({
        type: 'HIGH_SCORE',
        userId: userId,
        displayName: userDataForLeaderboard.displayName,
        gameId: gameId,
        gameName: game.name || 'a game',
        score: score,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    }

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
    console.error('Error submitting score:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;

    // Get user data
    let user = await User.getUserById(userId);

    if (!user) {
      // We don't create a user on a public GET request.
      // If the user doesn't exist, they don't have a profile.
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
    const requestingUserId = req.user.id;
    const { displayName } = req.body;

    // Authorization: Ensure the signed public key matches the user being updated
    if (userId !== requestingUserId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied. You can only update your own profile.'
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
    let user = await User.getUserById(userId);
    if (!user) {
      user = await User.createUser(userId, { displayName });
    }

    // Update user profile
    const updatedUser = await User.updateProfile(userId, { displayName });

    // Return updated user data
    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

async function getGlobalLeaderboard(req, res) {
  try {
    const leaderboard = await User.getGlobalLeaderboard(100);
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
}

async function getGameLeaderboard(req, res) {
  try {
    const { gameId } = req.params;
    const leaderboard = await Leaderboard.getGameLeaderboard(gameId, 100);
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
}

module.exports = {
  submitScore,
  getUserProfile,
  updateUserProfile,
  getGlobalLeaderboard,
  getGameLeaderboard
};
