const { db } = require('../config/firebase');
const crypto = require('crypto');


class Game {
  static async adminCreateGame(gameData) {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // Generate a random API key
      const apiKey = crypto.randomBytes(32).toString('hex');
      
      // Hash the API key for storage
      const salt = process.env.API_KEY_SALT || 'default-salt';
      const hashedApiKey = crypto
        .createHash('sha256')
        .update(apiKey + salt)
        .digest('hex');

      const gameShortName = gameData.name.trim().toLowerCase().replace(/\s+/g,'-');
      
      const gameRef = await db.collection('games').add({
        ...gameData,
        gameShortName: gameShortName,
        apiKey: hashedApiKey,
        createdAt: new Date()
      });
      
      const gameDoc = await gameRef.get();
      //const gameShortName = gameDoc.data().name.trim().toLowerCase().replace(/\s+/g,'-');
      
      // Return the game data with the plain API key (only shown once)
      return { 
        id: gameDoc.id, 
        ...gameDoc.data(),
        plainApiKey: apiKey
      };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  static async getGameById(gameId) {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      // First try to find by document ID
      const gameRef = db.collection('games').doc(gameId);
      const gameDoc = await gameRef.get();
      
      if (gameDoc.exists) {
        return { id: gameDoc.id, ...gameDoc.data() };
      }
      
      // If not found by ID, try to find by gameId field
      const query = db.collection('games').where('gameId', '==', gameId).limit(1);
      const snapshot = await query.get();
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting game:', error);
      throw error;
    }
  }

  static async verifyApiKey(gameId, apiKey) {
    if (!db) {
      throw new Error('Database not initialized');
    }
    
    try {
      const game = await this.getGameById(gameId);
      if (!game) {
        return false;
      }
      
      const salt = process.env.API_KEY_SALT || 'default-salt';
      const hashedApiKey = crypto
        .createHash('sha256')
        .update(apiKey + salt)
        .digest('hex');
      
      return game.apiKey === hashedApiKey;
    } catch (error) {
      console.error('Error verifying API key:', error);
      return false;
    }
  }
}

module.exports = Game;