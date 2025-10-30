const nacl = require('tweetnacl');
const bs58 = require('bs58');
const { TextEncoder } = require('util');
const Game = require('../models/Game');

// Middleware to verify a signed message from a Solana wallet
async function verifySolanaSignature(req, res, next) {
  try {
    const { auth } = req.body;
    if (!auth || !auth.publicKey || !auth.signature || !auth.message) {
      return res.status(401).json({ error: 'Missing authentication payload.' });
    }

    const { publicKey, signature, message } = auth;

    // Verify the signature
    const signatureBytes = Buffer.from(signature, 'base64');
    const messageBytes = new TextEncoder().encode(message);
    const publicKeyBytes = bs58.decode(publicKey);

    const isVerified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);

    if (!isVerified) {
      return res.status(401).json({ error: 'Invalid signature.' });
    }

    // Optional: Check if the message is recent to prevent replay attacks
    const messageTimestamp = parseInt(message.split(' at ')[1]);
    if (Date.now() - messageTimestamp > 60000) { // 1 minute tolerance
        return res.status(401).json({ error: 'Signature has expired.' });
    }

    // Attach user info to request object
    req.user = {
      id: publicKey,
      userId: publicKey,
    };

    next();
  } catch (error) {
    console.error('Solana signature verification failed:', error);
    return res.status(401).json({ error: 'Authentication failed.' });
  }
}

// Middleware to verify game API key (remains the same)
async function verifyApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    const { gameId } = req.body;
    
    if (!apiKey) {
      return res.status(401).json({ error: 'Missing API key' });
    }
    
    if (!gameId) {
      return res.status(400).json({ error: 'Missing gameId in request body' });
    }
    
    const isValid = await Game.verifyApiKey(gameId, apiKey);
    
    if (!isValid) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    next();
  } catch (error) {
    console.error('Error verifying API key:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Middleware to validate score data (remains the same)
function validateScore(req, res, next) {
  const { score } = req.body;
  
  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'Missing score' });
  }
  
  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative integer' });
  }
  
  next();
}

module.exports = {
  verifySolanaSignature,
  verifyApiKey,
  validateScore
};
