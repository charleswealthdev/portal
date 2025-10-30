import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

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
    icon: '🛡️',
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

export default function Games() {
  const [search, setSearch] = useState('');
  const { connected } = useWallet();

  const filteredGames = gamesData.filter(game => 
    game.name.toLowerCase().includes(search.toLowerCase()) ||
    game.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleGameLaunch = (game) => {
    // The new flow assumes the game client is also a Solana-aware application
    // and will handle its own connection and score submission.
    // The portal is only responsible for linking to the game.
    console.log('Launching game:', game.name);
    window.open(game.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-orbitron font-bold mb-2">Games</h1>
        <p className="text-gray-400 mb-8">Play and earn rewards on the Playrush platform.</p>
        
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGames.map((game) => (
            <div key={game.id} className="bg-[#111111] rounded-xl border border-[#8338ec]/30 overflow-hidden hover:border-[#8338ec]/60 transition-all hover:shadow-xl hover:shadow-[#8338ec]/20 flex flex-col">
              <div className="p-6 flex-grow">
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
                {connected ? (
                  <button 
                    onClick={() => handleGameLaunch(game)}
                    className="w-full bg-gradient-to-r from-[#8338ec] to-[#3a86ff] hover:from-[#722ed1] hover:to-[#1d6bcf] text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center"
                  >
                    Play Now
                  </button>
                ) : (
                  <div className="flex justify-center">
                     <WalletMultiButton />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
