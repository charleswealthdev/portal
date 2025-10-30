// This file is intentionally left blank.
// The API routes for /api/users/... are handled in api/[[...route]].js
// to consolidate all API routing into a single file and avoid conflicts.




// import { verifyWalletAuth } from '../../../backend/src/middleware/auth';
// import { getUserProfile } from '../../../backend/src/controllers/scoreController';

// export default async function handler(request, response) {
//   if (request.method !== 'GET') {
//     return response.status(405).json({ error: 'Method not allowed' });
//   }

//   try {
//     // Extract user ID from the request
//     const userId = request.query.userId;

//     // Verify wallet signature
//     const walletAddress = request.headers['x-wallet-address'];
//     const signature = request.headers['x-signature'];
//     const message = request.headers['x-message'];

//     if (!walletAddress || !signature || !message) {
//       return response.status(401).json({ error: 'Missing wallet authentication data' });
//     }

//     // Create a mock request object for the middleware
//     const mockReq = {
//       headers: {
//         'x-wallet-address': walletAddress,
//         'x-signature': signature,
//         'x-message': message
//       }
//     };

//     const mockRes = {
//       status: (code) => ({
//         json: (data) => {
//           response.status(code).json(data);
//           return { json: () => {} };
//         }
//       })
//     };

//     let nextCalled = false;
//     const next = () => { nextCalled = true; };

//     // Verify wallet signature using middleware
//     await verifyWalletAuth(mockReq, mockRes, next);

//     if (!nextCalled) {
//       // Authentication failed, response already sent by middleware
//       return;
//     }

//     // Call the controller function directly
//     await getUserProfile(
//       { params: { userId }, user: mockReq.user },
//       {
//         status: (code) => ({
//           json: (data) => {
//             response.status(code).json(data);
//             return { json: () => {} };
//           }
//         })
//       }
//     );
//   } catch (error) {
//     console.error('Error in user profile function:', error);
//     response.status(500).json({ error: 'Internal server error' });
//   }
// }
