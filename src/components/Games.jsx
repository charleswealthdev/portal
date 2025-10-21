import { useState, useEffect } from 'react';
import { useAuth } from '../PrivyAuth';

// Game data - in a production implementation, this would come from your backend
const gamesData = [
  { 
    id: 'chain-bros',
    name: 'Chain Bros', 
    url: 'https://chainbros.playrush.io', 
    description: 'Fast-paced chain adventure game.',
    icon: '⛓️',
    players: '1.2k',
    status: 'Live'
  },
  { 
    id: 'pixel-hunt',
    name: 'Pixel Hunt', 
    url: 'https://pixelhunt.playrush.io', 
    description: 'Pixelated hunting challenge.',
    icon: '🎯',
    players: '890',
    status: 'Live'
  },
  { 
    id: 'think-tac-toe',
    name: 'Think Tac Toe', 
    url: 'https://thinktactoe.playrush.io', 
    description: 'Strategic tic-tac-toe variant.',
    icon: '🧩',
    players: '650',
    status: 'Live'
  },
  { 
    id: 'solflare-defender',
    name: 'Solflare Defender', 
    url: 'https://solflaredefender.playrush.io', 
    description: 'Defend the Solflare network.',
    icon: '🛡',
    players: '1.5k',
    status: 'Live'
  },
  { 
    id: 'phantom-runner',
    name: 'Phantom Runner', 
    url: 'https://phantomrunner.playrush.io', 
    description: 'Endless runner in the Phantom universe.',
    icon: '👻',
    players: '2.1k',
    status: 'Live'
  },
  { 
    id: 'block-miner',
    name: 'Block Miner', 
    url: 'https://blockminer.playrush.io', 
    description: 'Mine blocks and build your empire.',
    icon: '⛏️',
    players: '980',
    status: 'Live'
  }
];

export default function Games({ onOpenModal }) {
  const [search, setSearch] = useState('');
  const [games, setGames] = useState(gamesData);
  const [loading, setLoading] = useState({});
  const { authenticated, accessToken, user } = useAuth();
  
  // Filter games based on search term
  const filteredGames = games.filter(game => 
    game.name.toLowerCase().includes(search.toLowerCase()) ||
    game.description.toLowerCase().includes(search.toLowerCase())
  );

  // Function to handle game launch
  const handleGameLaunch = async (game) => {
    if (!authenticated) {
      // Show sign in modal
      onOpenModal();
      return;
    }

    try {
      setLoading(prev => ({ ...prev, [game.id]: true }));

      // Pass authentication parameters to the game URL
      // Note: API key is server-side only for security - games must be configured with their API key
      const gameUrl = `${game.url}?token=${encodeURIComponent(accessToken)}&gameId=${encodeURIComponent(game.id)}&userId=${encodeURIComponent(user.id)}`;

      console.log('Launching game:', game.name);
      console.log('Game URL with auth params:', gameUrl.substring(0, 100) + '...');

      // Open the game in a new tab with authentication parameters
      window.open(gameUrl, '_blank');
    } catch (error) {
      console.error('Error launching game:', error);
    } finally {
      setLoading(prev => ({ ...prev, [game.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-orbitron font-bold mb-2">Games</h1>
        <p className="text-gray-400 mb-8">Play and earn rewards on the Playrush platform.</p>
        
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111111] border border-[#8338ec]/30 rounded-lg py-3 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-[#8338ec]"
            />
            <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        
        {/* Games Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden hover:border-[#8338ec]/60 transition-all hover:shadow-xl hover:shadow-[#8338ec]/20">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{game.icon}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    game.status === 'Live' 
                      ? 'bg-green-900/30 text-green-400' 
                      : 'bg-yellow-900/30 text-yellow-400'
                  }`}>
                    {game.status}
                  </span>
                </div>
                <h3 className="text-xl font-orbitron font-bold mt-4 mb-2">{game.name}</h3>
                <p className="text-gray-400 text-sm mb-4">{game.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#3a86ff]">{game.players} players</span>
                </div>
              </div>
              <div className="px-6 py-4 bg-[#1a1a1a] border-t border-[#8338ec]/20">
                <button 
                  onClick={() => handleGameLaunch(game)}
                  disabled={loading[game.id]}
                  className="w-full bg-gradient-to-r from-[#8338ec] to-[#3a86ff] hover:from-[#722ed1] hover:to-[#1d6bcf] text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                >
                  {loading[game.id] ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : (
                    'Play Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Authentication Status */}
        {!authenticated && (
          <div className="mt-8 p-6 bg-[#111111] rounded-xl border border-[#8338ec]/30 text-center">
            <h3 className="text-xl font-orbitron font-bold mb-2">Ready to Play?</h3>
            <p className="text-gray-400 mb-4">Sign in to access all games and start earning rewards!</p>
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