import { Link } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#8338ec]/50 z-50">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bebas bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-transparent bg-clip-text">
          Playrush
        </Link>
        <div className="hidden sm:flex space-x-6">
          <Link to="/games" className="text-white hover:text-[#ff006e] transition">Games</Link>
          <Link to="/community" className="text-white hover:text-[#ff006e] transition">Community</Link>
          <Link to="/leaderboard" className="text-white hover:text-[#ff006e] transition">Leaderboard</Link>
          <Link to="/profile" className="text-white hover:text-[#ff006e] transition">Profile</Link>
        </div>
        <div>
          <WalletMultiButton />
        </div>
      </nav>
    </header>
  );
}



// import { useAuth } from '../WalletAuth';
// import { Link } from 'react-router-dom';
// import { CustomWalletButton } from '../WalletAuth';

// export default function Header() {
//   const { authenticated, walletAddress, signOut } = useAuth();

//   const handleSignOut = async () => {
//     try {
//       await signOut();
//     } catch (err) {
//       console.error('Sign out error:', err);
//     }
//   };

//   const shortenAddress = (address) => {
//     if (!address) return '';
//     return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
//   };

//   return (
//     <header className="fixed top-0 left-0 right-0 bg-[#0A0A0A]/90 backdrop-blur-md border-b border-[#8338ec]/50 z-50">
//       <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
//         <Link to="/" className="text-2xl font-bebas bg-gradient-to-r from-[#ff006e] via-[#8338ec] to-[#3a86ff] text-transparent bg-clip-text">
//           Playrush
//         </Link>
//         <div className="hidden sm:flex space-x-6">
//           <Link to="/games" className="text-white hover:text-[#ff006e] transition">Games</Link>
//           <Link to="/community" className="text-white hover:text-[#ff006e] transition">Community</Link>
//           <Link to="/leaderboard" className="text-white hover:text-[#ff006e] transition">Leaderboard</Link>
//           <Link to="/profile" className="text-white hover:text-[#ff006e] transition">Profile</Link>
//         </div>
//         <div>
//           {authenticated && walletAddress ? (
//             <div className="flex items-center space-x-4">
//               <span className="text-[#3a86ff]">
//                 {shortenAddress(walletAddress)}
//               </span>
//               <button onClick={handleSignOut} className="bg-[#ff006e] text-white px-4 py-1 rounded hover:bg-[#8338ec] transition">
//                 Disconnect
//               </button>
//             </div>
//           ) : (
//             <CustomWalletButton />
//           )}
//         </div>
//       </nav>
//     </header>
//   );
// }
