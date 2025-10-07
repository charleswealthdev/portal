const { db, admin } = require('../config/firebase');
const Tournament = require('../models/Tournament');

async function createTournament(req, res) {
  try {
    // Extract data from request
    const tournamentData = req.body;

    const {id,name,description,timeLeft} = await Tournament.createTournament(tournamentData);

    /*

    */
    res.status(200).json({
      success: true,
      message: 'tournament created successfully',
      data: {
        id,
        name,
        description,
        timeLeft
      }
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({ error: 'Database service not available' });
    }

    //console.error('Error adding tournament:', error);
    //res.status(500).json({ error: 'Internal server error here'});
    res.status(error.status).send(error);
    console.log(error.message);
  }
}


async function getAllTournaments(req, res) {
  try {
    const allTournaments = await Tournament.getTournaments();

    /*

    */
    res.status(200).json({
      success: true,
      message: 'All tournaments',
      data: {allTournaments}
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({ error: 'Database service not available' });
    }

    console.error('Error adding tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

async function getTournamentById(req, res) {
  try {
    const {tournamentId} = req.params;

    const tournament = await Tournament.getOneTournament(tournamentId);

    /*

    */
    res.status(200).json({
      success: true,
      message: ` tournament: ${tournament.id}`,
      data: {tournament}
    });
  } catch (error) {
    if (error.message === 'Database not initialized') {
      console.error('Database not initialized:', error);
      return res.status(500).json({ error: 'Database service not available' });
    }

    console.error('Error adding tournament:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
    createTournament,
    getAllTournaments,
    getTournamentById
}