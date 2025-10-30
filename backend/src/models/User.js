const { db, admin } = require('../config/firebase');

class User {
  static async createUser(userId, initialData = {}) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return { id: userId, ...userDoc.data() };
    }

    const displayName = initialData.displayName || `${userId.substring(0, 6)}...${userId.substring(userId.length - 4)}`;

    const newUser = {
      id: userId,
      displayName,
      totalPoints: 0,
      gamesPlayed: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(newUser);
    return { id: userId, ...newUser };
  }

  static async getUserById(userId) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    return { id: userId, ...userDoc.data() };
  }

  static async updateTotalPoints(userId, points) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      totalPoints: admin.firestore.FieldValue.increment(points),
      gamesPlayed: admin.firestore.FieldValue.increment(1),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await userRef.get();
    return { id: userId, ...updatedDoc.data() };
  }

  static async updateProfile(userId, profileData) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      ...profileData,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await userRef.get();
    return { id: userId, ...updatedDoc.data() };
  }

  static async getGlobalLeaderboard(limit = 100) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const usersRef = db.collection('users');
    const query = usersRef.orderBy('totalPoints', 'desc').limit(limit);
    const querySnapshot = await query.get();

    const leaderboard = [];
    let rank = 1;
    querySnapshot.forEach((doc) => {
      const userData = doc.data();
      leaderboard.push({
        userId: doc.id,
        displayName: userData.displayName || 'Anonymous Player',
        totalPoints: userData.totalPoints || 0,
        rank: rank++
      });
    });

    return leaderboard;
  }
}

module.exports = User;
