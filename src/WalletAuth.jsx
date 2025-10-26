import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

// Import wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

// Auth Context
const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

// Loading screen - only show when connecting wallet
const WalletLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto mb-4"></div>
      <p className="text-white text-xl font-orbitron">Connecting Wallet...</p>
      <p className="text-gray-400 text-sm mt-2">Please connect your Solana wallet</p>
    </div>
  </div>
);

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const { publicKey, connected, signMessage, disconnect } = useWallet();
  const [authState, setAuthState] = useState({
    user: null,
    loading: false, // Changed to false - only load when connecting
    authenticated: false,
    walletAddress: null,
    accessToken: null,
  });

  useEffect(() => {
    if (connected && publicKey) {
      // User is connected, set authenticated
      setAuthState({
        user: { walletAddress: publicKey.toString() },
        loading: false,
        authenticated: true,
        walletAddress: publicKey.toString(),
        accessToken: null, // Will be set after backend auth
      });
    } else {
      // Not connected
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
        walletAddress: null,
        accessToken: null,
      });
    }
  }, [connected, publicKey]);

  const signIn = async () => {
    if (!publicKey || !signMessage) {
      throw new Error('Wallet not connected or does not support signing');
    }

    try {
      const message = `Sign in to Playrush\n\nWallet: ${publicKey.toString()}\nTimestamp: ${new Date().toISOString()}`;
      const encodedMessage = new TextEncoder().encode(message);
      const signature = await signMessage(encodedMessage);

      // Verify signature (basic check)
      const isValid = await verifySignature(message, signature, publicKey);
      if (!isValid) {
        throw new Error('Signature verification failed');
      }

      // Signature valid, user is authenticated
      setAuthState(prev => ({
        ...prev,
        authenticated: true,
      }));

      return { success: true, walletAddress: publicKey.toString() };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await disconnect();
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
        walletAddress: null,
        accessToken: null,
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  // Show loading only when connecting wallet
  if (authState.loading) return <WalletLoading />;

  return (
    <AuthContext.Provider value={{
      ...authState,
      signIn,
      signOut,
      wallet: { publicKey, connected, signMessage },
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Wallet Auth Provider (wraps the app)
export const WalletAuthProvider = ({ children }) => {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

// Utility function to verify signature
async function verifySignature(message, signature, publicKey) {
  try {
    const encodedMessage = new TextEncoder().encode(message);
    return PublicKey.verify(encodedMessage, signature, publicKey);
  } catch {
    return false;
  }
}

// Custom Connect Button (optional, for custom styling)
export const CustomWalletButton = () => {
  return (
    <WalletMultiButton
      className="!bg-gradient-to-r !from-[#ff006e] !to-[#8338ec] !text-white !px-4 !py-2 !rounded !hover:shadow-lg !transition !font-semibold"
      style={{ background: 'linear-gradient(to right, #ff006e, #8338ec)' }}
    />
  );
};
