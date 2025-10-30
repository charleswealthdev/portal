// This file is intentionally left blank.
// The functionality previously in this file (a custom sign-in modal)
// has been replaced by the default modal provided by the Solana Wallet Adapter's
// WalletModalProvider, which is configured in src/main.jsx.



// This component is no longer needed since wallet connection is handled directly in Header
// Keeping as empty component to avoid breaking imports
// export default function SignInModal({ isOpen, onClose }) {
//   if (!isOpen) return null;

//   return null; // Modal removed - wallet connection handled by Header
// }





// import { useState, useEffect, useRef } from 'react';
// import { usePrivy } from '@privy-io/react-auth';

// export default function SignInModal({ isOpen, onClose, setWalletAddress }) {
//   const modalRef = useRef(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(null);
//   const { login, ready } = usePrivy();

//   useEffect(() => {
//     if (isOpen) {
//       modalRef.current?.focus();
//       setError(null);
//       setLoading(null);
//     }
//   }, [isOpen]);

//   const handleGoogleSignIn = async () => {
//     setLoading('google');
//     setError(null);
//     try {
//       await login({ loginMethod: 'google' });
//       onClose();
//     } catch (err) {
//       setError(err.message || 'Failed to sign in with Google.');
//       setLoading(null);
//     }
//   };

//   const handleSolanaSignIn = async () => {
//     setLoading('solana');
//     setError(null);
//     try {
//       await login({ loginMethod: 'wallet' });
//       // Wallet address will be available through the Privy user object
//       onClose();
//     } catch (err) {
//       setError(err.message || 'Failed to connect Solana wallet.');
//       setLoading(null);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div
//       className="fixed inset-0 bg-[#0A0A0A] bg-opacity-75 flex items-center justify-center min-h-screen z-50"
//       role="dialog"
//       aria-labelledby="signin-modal-title"
//       aria-modal="true"
//     >
//       <div
//         ref={modalRef}
//         className="bg-[#111111] rounded-xl p-6 sm:p-8 w-full max-w-md border border-[#8338ec]/30 shadow-2xl shadow-[#8338ec]/20"
//         tabIndex="-1"
//       >
//         <div className="flex justify-between items-center mb-6">
//           <h2 id="signin-modal-title" className="text-2xl font-orbitron font-bold text-white">
//             Sign In
//           </h2>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white transition-colors"
//             aria-label="Close"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>

//         {error && (
//           <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
//             {error}
//           </div>
//         )}

//         <div className="space-y-4">
//           <button
//             onClick={handleGoogleSignIn}
//             disabled={loading === 'google'}
//             className="w-full flex items-center justify-center gap-3 bg-white text-gray-900 py-3 px-4 rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading === 'google' ? (
//               <svg className="animate-spin h-5 w-5 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <>
//                 <svg className="w-5 h-5" viewBox="0 0 24 24">
//                   <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
//                   <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
//                   <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
//                   <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
//                 </svg>
//                 Sign In with Google
//               </>
//             )}
//           </button>

//           <button
//             onClick={handleSolanaSignIn}
//             disabled={loading === 'solana'}
//             className="w-full flex items-center justify-center gap-3 bg-[#111111] text-white border border-[#8338ec]/50 py-3 px-4 rounded-lg font-medium hover:bg-[#1a1a1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {loading === 'solana' ? (
//               <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//             ) : (
//               <>
//                 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
//                   <path d="M12 0L4.615 4.33v8.693l7.385 4.33 7.385-4.33V4.33L12 0zm0 2.5l5.875 3.456v5.511L12 14.938l-5.875-3.471V5.956L12 2.5zm0 19.5l-5.875-3.456v-5.511L12 9.062l5.875 3.471v5.511L12 22z"/>
//                 </svg>
//                 Connect Solana Wallet
//               </>
//             )}
//           </button>
//         </div>

//         <div className="mt-6 text-center">
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-white font-medium transition-colors"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
