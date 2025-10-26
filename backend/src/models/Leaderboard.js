const { db, admin } = require('../config/firebase');

class Leaderboard {
  static async updateGameLeaderboard(gameId, userId, score, userData) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const scoreRef = db.collection('gameScores').doc(`${gameId}-${userId}`);
    const scoreDoc = await scoreRef.get();

    if (scoreDoc.exists) {
      const existingScore = scoreDoc.data().score;
      if (score <= existingScore) {
        // Don't update if new score is not higher
        return true;
      }
    }

    // Update or create the score
    await scoreRef.set({
      gameId,
      userId,
      score,
      userData,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    return true;
  }

  static async getGameLeaderboard(gameId, limit = 10) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    try {
      const scoresRef = db.collection('gameScores');
      const query = scoresRef.where('gameId', '==', gameId).orderBy('score', 'desc').limit(limit);
      const querySnapshot = await query.get();

      const leaderboard = [];
      let rank = 1;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        leaderboard.push({
          userId: data.userId,
          displayName: data.userData.displayName || 'Anonymous Player',
          score: data.score,
          rank: rank++
        });
      });

      return leaderboard;
    } catch (error) {
      // If index error, fall back to simpler query without ordering
      if (error.code === 9 && error.message.includes('requires an index')) {
        console.warn('Firestore index required for ordered query, falling back to unordered results');
        const scoresRef = db.collection('gameScores');
        const fallbackQuery = scoresRef.where('gameId', '==', gameId).limit(limit);
        const fallbackSnapshot = await fallbackQuery.get();

        const leaderboard = [];
        fallbackSnapshot.forEach((doc) => {
          const data = doc.data();
          leaderboard.push({
            userId: data.userId,
            displayName: data.userData.displayName || 'Anonymous Player',
            score: data.score,
            rank: 0 // No ranking without ordering
          });
        });

        return leaderboard;
      }
      throw error;
    }
  }

  static async getUserRankInGame(gameId, userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    // Get all scores for the game, ordered by score desc
    const scoresRef = db.collection('gameScores');
    const query = scoresRef.where('gameId', '==', gameId).orderBy('score', 'desc');
    const querySnapshot = await query.get();

    let rank = null;
    let currentRank = 1;
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.userId === userId) {
        rank = currentRank;
      }
      currentRank++;
    });

    return rank;
  }
}

module.exports = Leaderboard;
