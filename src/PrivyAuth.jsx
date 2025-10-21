import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';

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

  useEffect(() => {
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

  // Base config (Solana only + Google)
  const privyConfig = useMemo(() => ({
    appearance: {
      theme: 'dark',
      accentColor: '#676FFF',
      logo: '/assets/playrush-logo.png',
    },
    // Disable embedded wallets
    embeddedWallets: {
      createOnLogin: 'off',
    },
    loginMethods: ['wallet', 'google'],
    walletConnect: {
      // Disable all Ethereum wallets, only allow Solana
      excludeWalletIds: [
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96d', // Coinbase
        'c03dfee351b6fccf3fb0', // MetaMask
        '767fc0f6-0d3a-4a92-8b4b-5a0b0e2d3f3a', // Trust Wallet
        '4622a2b2d6af1c9844944291e5e7351a6aa24cd7', // Ledger
        '19177a98252e07ddfc9af2083ba42e07ebf564791', // WalletConnect
      ],
    },
  }), []);

  // Visibility for runtime verification
  console.log('Privy App ID:', privyAppId);
  console.log('Privy Config:', privyConfig);

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <AuthProvider>{children}</AuthProvider>
    </PrivyProvider>
  );
};
