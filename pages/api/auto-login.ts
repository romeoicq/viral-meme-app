import { NextApiRequest, NextApiResponse } from 'next';
import { login } from '../../lib/auth/authUtils';

// This is a special endpoint for automatic login - only for demonstration purposes
// In a real production environment, you would never have such an endpoint

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Automatically log in with admin credentials
    const result = login('admin', 'trendsphere2025');
    
    if (result.success && result.token) {
      // Set cookie directly from the server side
      // Use SameSite=Lax to ensure the cookie is sent with navigation requests
      res.setHeader('Set-Cookie', `authToken=${result.token}; Path=/; Max-Age=86400; SameSite=Lax`);
      
      // For debugging purposes
      console.log('Auto-login successful, token set:', result.token);
      
      // In API routes, we need to set the status code explicitly
      res.status(302).setHeader('Location', '/settings/llm');
      res.end();
    } else {
      // Fallback to login page with error
      res.redirect(302, '/login?error=automatic_login_failed');
    }
  } catch (error) {
    console.error('Error in auto-login:', error);
    res.redirect(302, '/login?error=server_error');
  }
}
