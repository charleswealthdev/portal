const API_BASE_URL = '/api'; // Adjust as needed for your deployment

// Fetch user profile from backend
export async function fetchUserProfile(userId, walletAddress, signMessage) {
  try {
    if (!walletAddress || !signMessage) throw new Error('Wallet not connected');
    const message = `Authenticate with PlayRush\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
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
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

// Update user profile on backend
export async function updateProfileOnBackend(userId, profileData, walletAddress, signMessage) {
  try {
    if (!walletAddress || !signMessage) throw new Error('Wallet not connected');
    const message = `Update profile on PlayRush\n\nWallet: ${walletAddress}\nTimestamp: ${new Date().toISOString()}`;
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
    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
