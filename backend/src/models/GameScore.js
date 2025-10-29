const admin = require('firebase-admin');
const db = admin.firestore();

class GameScore {
  // Returns [{ userId, displayName, score, rank }]
  static async getLeaderboard(gameId, limit = 10) {
    if (!db) throw new Error('Database not initialized');
    const ref = db.collection('gameScores').doc(gameId).collection('entries');
    const query = ref.orderBy('score', 'desc').limit(limit);
    const snapshot = await query.get();
    const leaderboard = [];
    let rank = 1;
    for (const doc of snapshot.docs) {
      const data = doc.data();
      leaderboard.push({
        userId: doc.id,
        displayName: data.displayName || 'Anonymous Player',
        score: data.score || 0,
        rank: rank++
      });
    }
    return leaderboard;
  }
}

module.exports = GameScore;
