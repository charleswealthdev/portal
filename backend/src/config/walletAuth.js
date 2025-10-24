// Wallet authentication configuration
// Since we're switching to Solana wallet adapter, this file is now for wallet verification

const jwt = require('jsonwebtoken');

// Function to verify wallet signature (for future use)
function verifyWalletSignature(message, signature, publicKey) {
  // This would verify the signature using Solana web3.js
  // For now, we'll implement basic JWT-based auth for wallet addresses
  try {
    // In a real implementation, you'd verify the signature here
    // For now, we'll just return true for connected wallets
    return true;
  } catch (error) {
    console.error('Wallet signature verification failed:', error);
    return false;
  }
}

// Function to generate a simple token for wallet auth
function generateWalletToken(walletAddress) {
  const payload = {
    walletAddress,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
  };

  const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
  return jwt.sign(payload, secret);
}

// Function to verify wallet token
function verifyWalletToken(token) {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
    const decoded = jwt.verify(token, secret);
    return decoded;
  } catch (error) {
    console.error('Wallet token verification failed:', error);
    return null;
  }
}

module.exports = {
  verifyWalletSignature,
  generateWalletToken,
  verifyWalletToken
};
