import { useEffect, useState } from 'react';
import { useAuth } from '../WalletAuth';
import { fetchUserProfile, updateProfileOnBackend } from '../api';

export default function Profile({ onOpenModal }) {
  const { user, loading, authenticated, walletAddress, signMessage, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchProfileData() {
      if (authenticated && user && walletAddress && signMessage) {
        try {
          setError(null);
          const profileData = await fetchUserProfile(user.id, walletAddress, signMessage);
          setProfile(profileData.data);
          setDisplayName(profileData.data.displayName ||
            user.walletAddress ||
            'Anonymous Player');
        } catch (err) {
          console.error('Failed to load profile:', err);
          setError('Failed to load profile: ' + (err.message || 'Unknown error'));
        }
      }
    }
    fetchProfileData();
  }, [authenticated, user, walletAddress, signMessage]);

  const validateDisplayName = (name) => {
    const valid = name.length >= 3 && name.length <= 20;
    setIsValid(valid);
    return valid;
  };

  const handleUpdateProfile = async () => {
    if (!authenticated || !user || !walletAddress || !signMessage) {
      setError('You must be logged in with your wallet to update your profile');
      return;
    }
    if (!validateDisplayName(displayName)) {
      setError('Display name must be between 3 and 20 characters');
      return;
    }
    if (displayName === profile?.displayName) {
      return; // No changes to save
    }
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      const updatedProfile = await updateProfileOnBackend(
        user.id,
        { displayName },
        walletAddress,
        signMessage
      );
      setProfile(updatedProfile.data);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!authenticated) return (
    <div>
      <h1>Profile</h1>
      <p>You need to sign in to view your profile.</p>
      <button onClick={onOpenModal}>Sign In</button>
    </div>
  );

  return (
    <div>
      <h1>Profile</h1>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}
      <div>
        <label htmlFor="displayName">Display Name</label>
        <input
          type="text"
          id="displayName"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            validateDisplayName(e.target.value);
          }}
          disabled={saving}
        />
        {!isValid && (
          <p style={{ color: 'red' }}>
            Display name must be between 3 and 20 characters
          </p>
        )}
        <button
          onClick={handleUpdateProfile}
          disabled={!isValid || displayName === profile?.displayName || saving}
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
