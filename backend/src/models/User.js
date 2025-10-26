const { db, admin } = require('../config/firebase');

class User {
  static async createUser(walletAddress, userData = {}) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(walletAddress);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return { id: walletAddress, ...userDoc.data() };
    }

    // Determine display name from userData (Google or wallet)
    let displayName = userData.displayName || 'Anonymous Player';
    if (userData.google && userData.google.name) {
      displayName = userData.google.name;
    } else if (userData.wallet && userData.wallet.address) {
      displayName = `${userData.wallet.address.substring(0, 6)}...${userData.wallet.address.substring(userData.wallet.address.length - 4)}`;
    }

    const newUser = {
      id: walletAddress,
      displayName,
      ...userData,
      totalPoints: 0,
      gamesPlayed: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    };

    await userRef.set(newUser);
    return { id: walletAddress, ...newUser };
  }

  static async getUserByWalletAddress(walletAddress) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(walletAddress);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return null;
    }

    return { id: walletAddress, ...userDoc.data() };
  }

  static async updateTotalPoints(walletAddress, points) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(walletAddress);
    await userRef.update({
      totalPoints: admin.firestore.FieldValue.increment(points),
      gamesPlayed: admin.firestore.FieldValue.increment(1),
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await userRef.get();
    return { id: walletAddress, ...updatedDoc.data() };
  }

  static async updateProfile(walletAddress, profileData) {
    if (!db) {
      throw new Error('Database not initialized');
    }

    const userRef = db.collection('users').doc(walletAddress);
    await userRef.update({
      ...profileData,
      lastActive: admin.firestore.FieldValue.serverTimestamp()
    });

    const updatedDoc = await userRef.get();
    return { id: walletAddress, ...updatedDoc.data() };
  }

  static async getGlobalLeaderboard(limit = 10) {
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
