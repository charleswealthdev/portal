import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { WalletAuthProvider } from './WalletAuth.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold text-red-500 mb-4">Something went wrong</h1>
            <p className="text-gray-300 mb-4">
              An error occurred while loading the application.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-neon-blue text-black px-4 py-2 rounded font-semibold hover:bg-opacity-80"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

import { Buffer } from 'buffer';
import util from 'util';

window.Buffer = Buffer;
window.util = util;
window.process = { env: {}, version: '', browser: true };

const LoadingSpinner = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-blue mx-auto mb-4"></div>
      <p className="text-white text-lg font-orbitron">Loading Playrush...</p>
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <Suspense fallback={<LoadingSpinner />}>
      <WalletAuthProvider>
        <App />
      </WalletAuthProvider>
    </Suspense>
  </ErrorBoundary>
);
