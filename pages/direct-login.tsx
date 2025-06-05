import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

// Demo token that matches the one in authUtils.ts
const DEMO_TOKEN = 'trendsphere-admin-demo-token';

export default function DirectLoginPage() {
  const [message, setMessage] = useState<string>('Setting up admin access...');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    // Simple function to directly set the demo token
    const setupAdminAccess = () => {
      try {
        // Set the demo token cookie directly
        document.cookie = `authToken=${DEMO_TOKEN}; path=/; max-age=86400; SameSite=Lax`; // 24 hours
        
        // Success message
        setMessage('Admin access granted! Redirecting to AI settings...');
        
        // Redirect to settings page after a short delay
        setTimeout(() => {
          router.push('/settings/llm');
        }, 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred setting up admin access');
        setMessage('');
      }
    };
    
    // Execute the setup function when the component mounts
    setupAdminAccess();
  }, [router]);
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Head>
        <title>Admin Access | TrendSphere</title>
      </Head>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          <Link href="/" className="font-medium text-blue-600 hover:text-blue-500">
            Return to TrendSphere
          </Link>
        </p>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {message && (
            <div className="text-center py-4">
              <div className="animate-pulse text-blue-600 font-medium">
                {message}
              </div>
              <div className="mt-4 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    {error}
                  </h3>
                  <div className="mt-4 text-sm">
                    <Link href="/login" className="font-medium text-red-800 hover:text-red-700">
                      Go to manual login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
