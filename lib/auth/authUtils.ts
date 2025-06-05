// Simple authentication utility for admin access
// In a real application, this would be integrated with a proper authentication system

// Admin credentials - in a real app, these would be stored securely
// and ideally use environment variables
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'trendsphere2025';

// Demo mode token - this is a special token that always works in development
// In a real app, you'd never have this
const DEMO_MODE_TOKEN = 'trendsphere-admin-demo-token';

// Store auth token in memory (this will reset on server restart)
// In a real app, use a proper session or JWT system
let authToken: string | null = null;

// Check if a provided token is valid
export const isValidToken = (token: string): boolean => {
  // In development, allow the demo token (for convenience)
  if (token === DEMO_MODE_TOKEN) {
    return true;
  }
  
  // Otherwise, check against the server-side token
  return token === authToken && !!authToken;
};

// Login function
export const login = (username: string, password: string): { success: boolean; token?: string; message?: string } => {
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Generate a simple token (in a real app, use a proper JWT)
    authToken = `admin-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    // For development convenience, we can also use a fixed demo token
    console.log('Login successful, token generated');
    
    return {
      success: true,
      token: process.env.NODE_ENV === 'production' ? authToken : DEMO_MODE_TOKEN
    };
  }
  
  return {
    success: false,
    message: 'Invalid username or password'
  };
};

// Logout function
export const logout = (): void => {
  authToken = null;
};

// Check if a request is from the admin
export const isAdmin = (requestToken?: string): boolean => {
  if (!requestToken) return false;
  
  console.log('Checking admin authorization for token:', requestToken.substring(0, 10) + '...');
  
  // Check if the token is valid
  const valid = isValidToken(requestToken);
  console.log('Token is valid:', valid);
  
  return valid;
};
