// Utility functions for API calls to the Playrush backend

import { useAuth } from './WalletAuth';
import { loadGameData } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get user profile
async function fetchUserProfile(userId, walletAddress, signMessage) {
  try {
    if (!walletAddress || !signMessage) {
      throw new Error('Wallet not connected');
    }

    // Create a message to sign for authentication
    const message = `Authenticate with PlayRush\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;

    // Sign the message
    const signature = await signMessage(new TextEncoder().encode(message));
    const signatureHex = Buffer.from(signature).toString('hex');

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'x-wallet-address': walletAddress,
        'x-signature': signatureHex,
        'x-message': message,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = 'Failed to fetch profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // If response.json() fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile
async function updateProfileOnBackend(userId, profileData, walletAddress, signMessage) {
  try {
    if (!walletAddress || !signMessage) {
      throw new Error('Wallet not connected');
    }

    // Create a message to sign for authentication
    const message = `Update profile on PlayRush\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;

    // Sign the message
    const signature = await signMessage(new TextEncoder().encode(message));
    const signatureHex = Buffer.from(signature).toString('hex');

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'x-wallet-address': walletAddress,
        'x-signature': signatureHex,
        'x-message': message,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(profileData)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update profile';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

// Submit game score
async function submitScore(gameId, score, walletAddress, signMessage, apiKey, userData = null) {
  try {
    if (!walletAddress || !signMessage) {
      throw new Error('Wallet not connected');
    }

    if (!apiKey) {
      throw new Error('No API key available');
    }

    // Create a message to sign for authentication
    const message = `Submit score to PlayRush\n\nGame: ${gameId}\nScore: ${score}\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;

    // Sign the message
    const signature = await signMessage(new TextEncoder().encode(message));
    const signatureHex = Buffer.from(signature).toString('hex');

    const requestBody = { gameId, score };
    if (userData) {
      requestBody.userData = userData;
    }

    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: {
        'x-wallet-address': walletAddress,
        'x-signature': signatureHex,
        'x-message': message,
        'x-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to submit score');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting score:', error);
    throw error;
  }
}

// Get global leaderboard
async function fetchGlobalLeaderboard() {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard/global`);

    if (!response.ok) {
      let errorMessage = 'Failed to fetch leaderboard';
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
}

// Get game leaderboard
async function fetchGameLeaderboard(gameId) {
  try {
    const response = await fetch(`${API_BASE_URL}/leaderboard/${gameId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch leaderboard');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching game leaderboard:', error);
    throw error;
  }
}

// Get recent community activities
async function fetchRecentActivities() {
  try {
    const response = await fetch(`${API_BASE_URL}/community/recent-activity`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch activities');
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    throw error;
  }
}

export {
  fetchUserProfile,
  updateProfileOnBackend,
  submitScore,
  fetchGlobalLeaderboard,
  fetchGameLeaderboard,
  fetchRecentActivities
};
