import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      include: ['buffer', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          coinbase: ['@coinbase/wallet-sdk'],
          three: ['three', '@react-three/fiber', '@react-three/drei'],
        },
      },
    },
  },
  assetsInclude: ['**/*.glb'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      buffer: 'buffer',
      util: 'util',
    },
  },
  define: {
    global: 'globalThis',
    'process.env': {},
    process: {
      env: {},
      version: '',
      browser: true,
    },
  },
  optimizeDeps: {
    include: ['buffer', 'util', '@coinbase/wallet-sdk'],
    exclude: ['vite-plugin-node-polyfills'],
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com; frame-src 'self' https://accounts.google.com; connect-src 'self' https://api.mainnet-beta.solana.com https://explorer-api.walletconnect.com wss://relay.walletconnect.com http://localhost:3003 http://localhost:3002 https://www.google-analytics.com https://firestore.googleapis.com; img-src 'self' data: https://lh3.googleusercontent.com https://www.googletagmanager.com https://www.google.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; object-src 'none'; base-uri 'self';",
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3002',
        changeOrigin: true,
        secure: false,
      },
    },
    mimeTypes: {
      'js': 'application/javascript',
      'mjs': 'application/javascript',
      'json': 'application/json',
    },
  },
});
