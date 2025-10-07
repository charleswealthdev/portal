const e = require('express');
const { db, admin } = require('../config/firebase');
const crypto = require('crypto');

class Tournament {
/*
  Create  tournament
*/
  static async createTournament(tournamentData) {
    if (!db) {
      throw new Error('Database not initialized');
    }
    const td = tournamentData.tournamentId;
    if (!td) {
      const err = new Error('Missing tournamentId');
      err.status = 500;
      err.code = 'Missing required field';
      throw err;
    }

    try {
      const gameDoc = await db.collection('games').doc(tournamentData.gameId).get();

      if (gameDoc.exists){
        // Generate a random API key
        const apiKey = crypto.randomBytes(32).toString('hex');
        
        // Hash the API key for storage
        const salt = process.env.API_KEY_SALT || 'default-salt';
        const hashedApiKey = crypto
          .createHash('sha256')
          .update(apiKey + salt)
          .digest('hex');

        const startTime = new Date(); // current timestamp
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // adds 60 minutes
      
        const tournamentRef = await db.collection('tournaments').add({
          ...tournamentData,
          game: gameDoc.data().name,
          apiKey: hashedApiKey,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          participants: [],
          rounds: [],
          createdAt: new Date()
        });
        
        const tournamentDoc = await tournamentRef.get();
        const timeLeftUnix = (tournamentDoc.data().endTime.toDate() - new Date());
        const timeLeft = timeLeftUnix > 0 ? timeLeftUnix/60000 : 0;
        
        // Return the tournament data with the plain API key (only shown once)
        return { 
          id: tournamentDoc.id,
          ...tournamentDoc.data(),
          timeLeft,
          plainApiKey: apiKey
        };
      }else{
        const e = new Error(`Game with id : ${tournamentData.gameId} not found in database`);
        e.status = 404;
        e.code =  `Game not in database`
        throw e;
      }

    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

/*
  Create  tournament by id
*/
  static async getOneTournament(tournamentId) {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      try {
        // First try to find by document ID
        const tournamentRef = db.collection('tournaments').doc(tournamentId);
        const tournamentDoc = await tournamentRef.get();
        
        if (tournamentDoc.exists) {
          const timeLeftUnix = (tournamentDoc.data().endTime.toDate() - new Date());
          const timeLeft = timeLeftUnix > 0 ? timeLeftUnix/60000 : 0;

          return {
            id: tournamentDoc.id,
            ...tournamentDoc.data(),
            timeLeft
          };
        }
        
        // If not found by ID, try to find by tournamentId field
        const query = db.collection('tournaments').where('tournamentId', '==', tournamentId).limit(1);
        const snapshot = await query.get();
        
        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          const timeLeftUnix = (tournamentDoc.data().endTime.toDate() - new Date());
          const timeLeft = timeLeftUnix > 0 ? timeLeftUnix/60000 : 0;

          return {
            id: doc.id,
            ...doc.data(),
            timeLeft
          };
        }
        
        return null;
      } catch (error) {
        console.error('Error getting tournament:', error);
        throw error;
      }
    }
  
    static async updateTournamentById(){
      
    }

    static async verifyApiKey(tournamentId, apiKey) {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      try {
        const tournament = await this.gettournamentById(tournamentId);
        if (!tournament) {
          return false;
        }
        
        const salt = process.env.API_KEY_SALT || 'default-salt';
        const hashedApiKey = crypto
          .createHash('sha256')
          .update(apiKey + salt)
          .digest('hex');
        
        return tournament.apiKey === hashedApiKey;
      } catch (error) {
        console.error('Error verifying API key:', error);
        return false;
      }
    }

    
/*
  Create all tournament
*/
  static async getTournaments() {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      try {
        // First try to find by document ID
        const tournamentSnapshot = await db.collection('tournaments').get()
        
        if (!tournamentSnapshot.empty) {
          const allTournaments = tournamentSnapshot.docs.map((doc) => {
          const timeLeftUnix = (doc.data().endTime.toDate() - new Date());
          const timeLeft = timeLeftUnix > 0 ? timeLeftUnix/60000 : 0;
          
            return {
              id: doc.id,
              ...doc.data(),
              timeLeft
            }
          }
        );

          return {
            message: 'Tournaments fetched successfully',
            tournaments: allTournaments
          };
        }else{
          return {
            tournaments: [],
            message: 'No tournaments available'
          };
        }
        
      } catch (error) {
        console.error('Error getting tournament:', error);
        throw error;
      }
    }
/*
  // Under development
  Update tournament by id
*/
    static async updateTournamentById(){
      
    }

/*
  // Under development  
  Verify API key & tournament id
*/
    static async verifyApiKey(tournamentId, apiKey) {
      if (!db) {
        throw new Error('Database not initialized');
      }
      
      try {
        const tournament = await this.gettournamentById(tournamentId);
        if (!tournament) {
          return false;
        }
        
        const salt = process.env.API_KEY_SALT || 'default-salt';
        const hashedApiKey = crypto
          .createHash('sha256')
          .update(apiKey + salt)
          .digest('hex');
        
        return tournament.apiKey === hashedApiKey;
      } catch (error) {
        console.error('Error verifying API key:', error);
        return false;
      }
    }
}

module.exports = Tournament;