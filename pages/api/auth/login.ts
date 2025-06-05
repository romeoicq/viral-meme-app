import { NextApiRequest, NextApiResponse } from 'next';
import { login } from '../../../lib/auth/authUtils';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ 
        success: false, 
        message: 'Method not allowed' 
      });
    }

    // Get username and password from request body
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username and password are required' 
      });
    }

    // Attempt to login
    const result = login(username, password);
    
    if (result.success && result.token) {
      // Return success with token
      return res.status(200).json({ 
        success: true, 
        token: result.token,
        message: 'Login successful' 
      });
    } else {
      // Return error
      return res.status(401).json({ 
        success: false, 
        message: result.message || 'Invalid username or password' 
      });
    }
  } catch (error) {
    console.error('Error in login API:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during login', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}
