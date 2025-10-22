import React, { createContext, useContext, useMemo, useState } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// --- Styles for wallet modal ---
require('@solana/wallet-adapter-react-ui/styles.css');

// Constants
const PRIVY_APP_ID_ERROR = 'Invalid Privy App ID. Please check your .env file.';
const PRIVY_LOADING_TEXT = 'Initializing Wallet...';

// Loading screen during wallet initialization
const PrivyLoading = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-neon-blue mx-auto mb-4"></div>
      <p className="text-white text-xl font-orbitron">{PRIVY_LOADING_TEXT}</p>
      <p className="text-gray-400 text-sm mt-2">Connecting to Solana network</p>
    </div>
  </div>
);

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    authenticated: false,
    accessToken: null,
  });

  React.useEffect(() => {
    if (!ready) return;

    const setLoggedOut = () =>
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
        accessToken: null,
      });

    if (!authenticated || !user) {
      setLoggedOut();
      return;
    }

    const fetchAccessToken = async () => {
      try {
        const token = await getAccessToken();
        setAuthState({
          user,
          loading: false,
          authenticated: true,
          accessToken: token ?? null,
        });
      } catch (error) {
        console.error('Error getting access token:', error);
        setAuthState({
          user,
          loading: false,
          authenticated: true,
          accessToken: null,
        });
      }
    };

    fetchAccessToken();
  }, [ready, authenticated, user, getAccessToken]);

  if (authState.loading) return <PrivyLoading />;

  return (
    <AuthContext.Provider value={{ ...authState, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const PrivyAuthProvider = ({ children }) => {
  const { ready, authenticated, user, logout, getAccessToken } = usePrivy();
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    authenticated: false,
    accessToken: null,
  });

  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    []
  );

  const privyAppId = import.meta.env.VITE_PRIVY_APP_ID;

  // Fail-fast if APP ID is not valid
  if (!privyAppId || typeof privyAppId !== 'string' || privyAppId.trim().length < 10) {
    console.error(PRIVY_APP_ID_ERROR);
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Configuration Error</h1>
          <p className="text-gray-300 mb-4">{PRIVY_APP_ID_ERROR}</p>
          <p className="text-sm text-gray-500">
            Make sure VITE_PRIVY_APP_ID is properly set in your .env file.
          </p>
        </div>
      </div>
    );
  }

  const privyConfig = useMemo(() => ({
    appearance: {
      theme: 'dark',
      accentColor: '#676FFF',
      logo: '/assets/playrush-logo.png',
    },
    loginMethods: ['google'],
    embeddedWallets: { createOnLogin: 'off' },
  }), []);

  // Handle Privy authentication state
  React.useEffect(() => {
    if (!ready) return;

    const setLoggedOut = () =>
      setAuthState({
        user: null,
        loading: false,
        authenticated: false,
        accessToken: null,
      });

    if (!authenticated || !user) {
      setLoggedOut();
      return;
    }

    const fetchAccessToken = async () => {
      try {
        const token = await getAccessToken();
        setAuthState({
          user,
          loading: false,
          authenticated: true,
          accessToken: token ?? null,
        });
      } catch (error) {
        console.error('Error getting access token:', error);
        setAuthState({
          user,
          loading: false,
          authenticated: true,
          accessToken: null,
        });
      }
    };

    fetchAccessToken();
  }, [ready, authenticated, user, getAccessToken]);

  if (authState.loading) return <PrivyLoading />;

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <AuthContext.Provider value={{ ...authState, logout }}>
              {children}
            </AuthContext.Provider>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </PrivyProvider>
  );
};
