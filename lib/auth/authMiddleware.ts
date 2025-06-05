import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext } from 'next';
import { isAdmin } from './authUtils';
import { ParsedUrlQuery } from 'querystring';

// Middleware for API routes
export const withAdminAuth = (handler: Function) => async (req: NextApiRequest, res: NextApiResponse) => {
  // Get token from the request headers
  let token = req.headers.authorization?.replace('Bearer ', '') || '';
  
  // If no Authorization header, try to get from cookies
  if (!token && req.cookies) {
    token = req.cookies.authToken || '';
  }
  
  console.log('API Auth check - Token found:', !!token);
  
  // Check if user is admin
  if (!isAdmin(token)) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized access. Please log in as an administrator.'
    });
  }
  
  // If authorized, continue to the handler
  return handler(req, res);
};

// For pages, we can use this to get server-side props with authentication
export const getAuthServerSideProps = async (
  context: GetServerSidePropsContext<ParsedUrlQuery>,
  callback?: (isAuthenticated: boolean) => Promise<any>
) => {
  const { req, res } = context;
  
  // Get token from cookies
  const token = req.cookies.authToken || '';
  
  console.log('Page Auth check - Token found:', !!token);
  
  // Check if user is admin
  const isAuthenticated = isAdmin(token);
  
  console.log('Is authenticated:', isAuthenticated);
  
  // If not authenticated, redirect to login page
  if (!isAuthenticated) {
    return {
      redirect: {
        destination: '/login?returnUrl=' + encodeURIComponent(context.resolvedUrl),
        permanent: false,
      },
    };
  }
  
  // If authentication succeeds and a callback is provided, call it
  if (callback) {
    const additionalProps = await callback(isAuthenticated);
    return {
      props: {
        isAuthenticated,
        ...additionalProps,
      },
    };
  }
  
  // Otherwise just return that the user is authenticated
  return {
    props: {
      isAuthenticated,
    },
  };
};
