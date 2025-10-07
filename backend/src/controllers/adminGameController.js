const { db, admin } = require('../config/firebase');
const Game = require('../models/Game');

async function createGame(req, res) {
  try {
    // Extract data from request
    const gameData = req.body;

    const {id,name,gameShortname,description} = await Game.adminCreateGame(gameData);

    /*

    */
    res.status(200).json({
      success: true,
      message: 'Game created successfully',
      data: {
        id,
        name,
        gameShortName,
        description
      }
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({ error: 'Database service not available' });
    }

    console.error('Error adding game:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {createGame}