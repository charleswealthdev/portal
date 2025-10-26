const { verifyWalletSignature, generateWalletToken, verifyWalletToken } = require('../config/walletAuth');
const Game = require('../models/Game');
const { PublicKey } = require('@solana/web3.js');

// Middleware to verify wallet signature
async function verifyWalletAuth(req, res, next) {
  try {
    // Get signature data from headers
    const walletAddress = req.headers['x-wallet-address'];
    const signature = req.headers['x-signature'];
    const message = req.headers['x-message'];

    if (!walletAddress || !signature || !message) {
      return res.status(401).json({ error: 'Missing wallet authentication data' });
    }

    // Verify the signature
    const isValid = await verifyWalletSignature(message, signature, walletAddress);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Attach user info to request
    req.user = {
      userId: walletAddress,
      id: walletAddress,
      walletAddress: walletAddress
    };

    console.log('Wallet signature verified for user:', req.user.userId);
    next();
  } catch (error) {
    console.error('Wallet signature verification failed:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Legacy middleware for JWT tokens (for backward compatibility)
async function verifyWalletTokenMiddleware(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify the token with wallet auth
    const payload = verifyWalletToken(token);

    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user info to request
    req.user = {
      userId: payload.walletAddress,
      id: payload.walletAddress,
      walletAddress: payload.walletAddress
    };

    console.log('Wallet token verified for user:', req.user.userId);
    next();
  } catch (error) {
    console.error('Wallet token verification failed:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Middleware to verify game API key
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

    // Verify API key
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

// Middleware to validate score data
function validateScore(req, res, next) {
  const { gameId, score } = req.body;

  if (!gameId) {
    return res.status(400).json({ error: 'Missing gameId' });
  }

  if (score === undefined || score === null) {
    return res.status(400).json({ error: 'Missing score' });
  }

  if (!Number.isInteger(score) || score < 0) {
    return res.status(400).json({ error: 'Score must be a non-negative integer' });
  }

  next();
}

module.exports = {
  verifyWalletAuth,
  verifyWalletToken: verifyWalletTokenMiddleware,
  verifyApiKey,
  validateScore
};
