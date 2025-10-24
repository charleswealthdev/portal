// Utility functions for API calls to the Playrush backend

import { useAuth } from './WalletAuth';
import { loadGameData } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Get user profile
async function fetchUserProfile(userId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
async function updateProfileOnBackend(userId, profileData, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
async function submitScore(gameId, score, accessToken, apiKey, userData = null) {
  try {
    if (!accessToken) {
      throw new Error('No access token available');
    }

    if (!apiKey) {
      throw new Error('No API key available');
    }

    const requestBody = { gameId, score };
    if (userData) {
      requestBody.userData = userData;
    }

    const response = await fetch(`${API_BASE_URL}/submit-score`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
