const { PrivyClient } = require('@privy-io/server-auth');

let privy = null;

// Initialize Privy client only if we have credentials
if (process.env.PRIVY_APP_ID && process.env.PRIVY_APP_SECRET) {
  try {
    console.log('Initializing Privy client with APP ID:', process.env.PRIVY_APP_ID);
    privy = new PrivyClient({
      appId: process.env.PRIVY_APP_ID,
      appSecret: process.env.PRIVY_APP_SECRET,
    });
    console.log('Privy client initialized successfully');
  } catch (error) {
    console.error('Error initializing Privy client:', error);
  }
} else {
  console.warn('Privy client not initialized - missing credentials');
  console.log('PRIVY_APP_ID set:', !!process.env.PRIVY_APP_ID);
  console.log('PRIVY_APP_SECRET set:', !!process.env.PRIVY_APP_SECRET);
}

module.exports = { privy };
