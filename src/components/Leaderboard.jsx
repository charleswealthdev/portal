import { useEffect, useState } from 'react';
import { useAuth } from '../WalletAuth';
import { fetchGlobalLeaderboard, fetchGameLeaderboard } from '../api';

export default function Leaderboard({ onOpenModal }) {
  const { authenticated, user, accessToken } = useAuth();
  const [globalLeaderboard, setGlobalLeaderboard] = useState(null);
  const [gameLeaderboards, setGameLeaderboards] = useState({});
  const [loading, setLoading] = useState({ global: true, games: {} });
  const [expandedSection, setExpandedSection] = useState(null);
  const [seasonEndDate] = useState(new Date('2025-12-31'));
  const [error, setError] = useState(null);

  // Game data - in a production implementation, this would come from your backend
  const games = [
    {
      id: 'chain-bros',
      name: 'Chain Bros',
      icon: '⛓️'
    },
    {
      id: 'pixel-hunt',
      name: 'Pixel Hunt',
      icon: '🎯'
    },
    {
      id: 'think-tac-toe',
      name: 'Think Tac Toe',
      icon: '🧩'
    }
  ];

  useEffect(() => {
    async function fetchData(retryCount = 0) {
      try {
        setError(null);

        // Fetch global leaderboard
        setLoading(prev => ({ ...prev, global: true }));
        const globalData = await fetchGlobalLeaderboard();
        setGlobalLeaderboard(globalData);
        setLoading(prev => ({ ...prev, global: false }));

        // Fetch game leaderboards
        const gameLeaderboardsData = {};
        for (const game of games) {
          try {
            setLoading(prev => ({ ...prev, games: { ...prev.games, [game.id]: true } }));
            const gameData = await fetchGameLeaderboard(game.id);
            gameLeaderboardsData[game.id] = gameData;
            setLoading(prev => ({ ...prev, games: { ...prev.games, [game.id]: false } }));
          } catch (err) {
            console.error(`Failed to load leaderboard for ${game.id}:`, err);
            setLoading(prev => ({ ...prev, games: { ...prev.games, [game.id]: false } }));
            // Don't fail the entire operation if one game fails
          }
        }
        setGameLeaderboards(gameLeaderboardsData);
      } catch (err) {
        console.error('Failed to load leaderboard data:', err);

        // Retry logic for network errors
        if (retryCount < 3 && (err.message?.includes('fetch') || err.message?.includes('network'))) {
          console.log(`Retrying leaderboard fetch (attempt ${retryCount + 1})...`);
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        // Fix: Do not set error if the error is due to 403 or 401 unauthorized (likely token expired)
        if (err.message?.includes('403') || err.message?.includes('401')) {
          console.warn('Unauthorized access to leaderboard, skipping error display.');
          setError(null);
          setLoading({ global: false, games: {} });
          return;
        }

        setError('Failed to load leaderboard data. Please check your connection and try again.');
        setLoading({ global: false, games: {} });
      }
    }
    fetchData();
  }, []);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const formatScore = (score) => {
    return score?.toLocaleString() || '0';
  };

  const getTimeRemaining = () => {
    const now = new Date();
    const difference = seasonEndDate - now;
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0 };
    }
    
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const { days, hours, minutes } = getTimeRemaining();

  const getUserRank = () => {
    if (!authenticated || !user || !globalLeaderboard || !Array.isArray(globalLeaderboard)) return null;

    // Find user's rank in the global leaderboard
    const userEntry = globalLeaderboard.find(entry => entry.userId === user.id);
    return userEntry ? userEntry.rank : null;
  };

  const userRank = getUserRank();

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-orbitron font-bold mb-4 bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-transparent bg-clip-text">
            Leaderboard
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Compete with other players and climb to the top of the rankings. Season ends in{' '}
            <span className="text-[#8338ec] font-bold">
              {days}d {hours}h {minutes}m
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* User Rank Card */}
        {authenticated && user && (
          <div className="bg-gradient-to-r from-[#8338ec]/20 to-[#3a86ff]/20 border border-[#8338ec]/50 rounded-xl p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div className="flex items-center mb-4 sm:mb-0">
                <div className="w-16 h-16 rounded-full bg-[#8338ec]/30 flex items-center justify-center mr-4">
                  <span className="text-2xl">
                    {user.google?.name?.charAt(0) || user.wallet?.address?.charAt(0) || 'P'}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-orbitron font-bold">
                    {user.google?.name || 
                     (user.wallet?.address ? 
                      `${user.wallet.address.substring(0, 6)}...${user.wallet.address.substring(user.wallet.address.length - 4)}` : 
                      'Player')}
                  </h3>
                  <p className="text-gray-400">Your position</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-3xl font-orbitron font-bold text-[#8338ec]">#{userRank || '--'}</div>
                <p className="text-gray-400">Global Rank</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Leaderboard */}
        <div className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden mb-8">
          <div className="p-6 border-b border-[#8338ec]/20">
            <h2 className="text-2xl font-orbitron font-bold">Global Rankings</h2>
            <p className="text-gray-400">Top players across all games</p>
          </div>
          
          {loading.global ? (
            <div className="p-8 text-center">
              <svg className="animate-spin h-10 w-10 text-[#8338ec] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-4">Loading leaderboard...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#8338ec]/20">
                    <th className="text-left p-4 font-orbitron">Rank</th>
                    <th className="text-left p-4 font-orbitron">Player</th>
                    <th className="text-right p-4 font-orbitron">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {globalLeaderboard && Array.isArray(globalLeaderboard) && globalLeaderboard.map((player, index) => (
                    <tr 
                      key={player.userId} 
                      className={`border-b border-[#8338ec]/10 hover:bg-[#1a1a1a] ${
                        authenticated && user && player.userId === user.id ? 'bg-[#8338ec]/10' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          player.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                          player.rank === 3 ? 'bg-amber-900/20 text-amber-700' :
                          'bg-[#1a1a1a] text-gray-400'
                        }`}>
                          {player.rank}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-[#8338ec]/30 flex items-center justify-center mr-3">
                            <span>{player.displayName?.charAt(0) || 'P'}</span>
                          </div>
                          <span className="font-medium">{player.displayName || 'Anonymous Player'}</span>
                          {authenticated && user && player.userId === user.id && (
                            <span className="ml-2 px-2 py-1 bg-[#8338ec]/30 text-[#8338ec] text-xs rounded-full">You</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right font-orbitron font-bold">{formatScore(player.totalPoints)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Game Leaderboards */}
        <div>
          <h2 className="text-2xl font-orbitron font-bold mb-6">Game Leaderboards</h2>
          
          <div className="space-y-6">
            {games.map((game) => (
              <div 
                key={game.id} 
                className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(game.id)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-[#1a1a1a] transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-3xl mr-4">{game.icon}</span>
                    <div>
                      <h3 className="text-xl font-orbitron font-bold">{game.name}</h3>
                      <p className="text-gray-400">Top players</p>
                    </div>
                  </div>
                  <svg 
                    className={`w-5 h-5 transform transition-transform ${
                      expandedSection === game.id ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {expandedSection === game.id && (
                  <div className="border-t border-[#8338ec]/20 p-6">
                    {loading.games[game.id] ? (
                      <div className="p-8 text-center">
                        <svg className="animate-spin h-8 w-8 text-[#8338ec] mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <p className="mt-4">Loading {game.name} leaderboard...</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-[#8338ec]/20">
                              <th className="text-left p-3 font-orbitron">Rank</th>
                              <th className="text-left p-3 font-orbitron">Player</th>
                              <th className="text-right p-3 font-orbitron">Score</th>
                            </tr>
                          </thead>
                          <tbody>
                            {gameLeaderboards[game.id]?.map((player) => (
                              <tr key={`${game.id}-${player.userId}`} className="border-b border-[#8338ec]/10 hover:bg-[#1a1a1a]">
                                <td className="p-3">
                                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                                    player.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                    player.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                                    player.rank === 3 ? 'bg-amber-900/20 text-amber-700' :
                                    'bg-[#1a1a1a] text-gray-400'
                                  }`}>
                                    {player.rank}
                                  </div>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-[#8338ec]/30 flex items-center justify-center mr-2">
                                      <span className="text-sm">{player.displayName?.charAt(0) || 'P'}</span>
                                    </div>
                                    <span>{player.displayName || 'Anonymous Player'}</span>
                                    {authenticated && user && player.userId === user.id && (
                                      <span className="ml-2 px-1 py-0.5 bg-[#8338ec]/30 text-[#8338ec] text-xs rounded-full">You</span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 text-right font-orbitron">{formatScore(player.score)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sign In Prompt */}
        {!authenticated && (
          <div className="mt-8 p-6 bg-[#111111] rounded-xl border border-[#8338ec]/30 text-center">
            <h3 className="text-xl font-orbitron font-bold mb-2">Join the Competition</h3>
            <p className="text-gray-400 mb-4">Sign in to track your progress and climb the leaderboard!</p>
            <button
              onClick={onOpenModal}
              className="bg-gradient-to-r from-[#ff006e] to-[#8338ec] hover:from-[#d6005a] hover:to-[#722ed1] text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
