import { useEffect, useState, useCallback } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { fetchRecentActivities, fetchUserProfile } from '../api';

// Mock community tasks - this should be moved to a backend service in the future
const communityTasks = [
    { id: 1, title: 'Follow @playrushio on Twitter', points: 50, url: 'https://twitter.com/playrushio' },
    { id: 2, title: 'Retweet our latest announcement', points: 100, url: 'https://twitter.com/playrushio' },
    { id: 3, title: 'Join our Discord server', points: 75, url: 'https://discord.gg/playrush' },
    { id: 4, title: 'Share your high score', points: 150, isInternal: true },
];

export default function Community() {
  const { connected, publicKey } = useWallet();
  const [activities, setActivities] = useState([]);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCommunityData = useCallback(async () => {
    setLoading(true);
    try {
      const activityData = await fetchRecentActivities();
      setActivities(activityData || []);

      if (connected && publicKey) {
        const profileData = await fetchUserProfile(publicKey.toBase58());
        setProfile(profileData.data);
      }
    } catch (err) {
      setError('Failed to load community data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [connected, publicKey]);

  useEffect(() => {
    fetchCommunityData();
  }, [fetchCommunityData]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-[#8338ec] mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Loading community...</p>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-orbitron font-bold mb-6">Community</h1>
          <p className="text-gray-400 mb-8">Join our community to participate in events, complete tasks, and climb the social leaderboard.</p>
          <WalletMultiButton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-orbitron font-bold mb-2">Community Hub</h1>
        <p className="text-gray-400 mb-8">Engage, earn, and climb the ranks!</p>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Community Tasks */}
        <div className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden mb-8">
          <div className="p-6 border-b border-[#8338ec]/20">
            <h2 className="text-2xl font-orbitron font-bold">Community Tasks</h2>
            <p className="text-gray-400">Complete tasks to earn points.</p>
          </div>
          <div className="divide-y divide-[#8338ec]/20">
            {communityTasks.map((task) => (
              <div key={task.id} className="p-6 flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-orbitron font-bold">{task.title}</h3>
                  <p className="text-gray-400 text-sm">+{task.points} points</p>
                </div>
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="bg-[#8338ec] hover:bg-[#722ed1] text-white font-medium px-4 py-2 rounded-lg transition-colors">
                  Go
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden">
          <div className="p-6 border-b border-[#8338ec]/20">
            <h2 className="text-2xl font-orbitron font-bold">Recent Activity</h2>
            <p className="text-gray-400">Latest achievements from the community.</p>
          </div>
          <div className="divide-y divide-[#8338ec]/20">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="p-6 flex items-center hover:bg-[#1a1a1a] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-400 text-sm">
                      <span className="font-bold text-white">{activity.displayName}</span>
                      {` achieved a new high score of ${activity.score.toLocaleString()} in `}
                      <span className="font-bold text-white">{activity.gameName}</span>!
                    </p>
                    <p className="text-gray-500 text-xs mt-2">{formatTimeAgo(activity.timestamp)}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="bg-[#ff006e]/20 text-[#ff006e] px-2 py-1 rounded-full text-xs font-bold">
                      +{activity.scoreDifference || activity.score} pts
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-gray-500">No recent activity.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
