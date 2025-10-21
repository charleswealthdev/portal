import { verifyPrivyToken } from '../../backend/src/middleware/auth';
import { getUserProfile } from '../../backend/src/controllers/scoreController';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract user ID from the request
    const userId = request.query.userId;
    
    // Verify token
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return response.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    
    const token = authHeader.substring(7);
    
    // Verify Privy token
    try {
      const decodedToken = await verifyPrivyToken(token);
      // Token is valid, proceed
    } catch (error) {
      return response.status(401).json({ error: 'Invalid or expired token' });
    }
    
    // Call the controller function directly
    await getUserProfile(
      { params: { userId }, user: { id: userId } },
      {
        status: (code) => ({
          json: (data) => {
            response.status(code).json(data);
            return { json: () => {} };
          }
        })
      }
    );
  } catch (error) {
    console.error('Error in user profile function:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}