import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect, useState } from 'react';
import { fetchIfNeeded } from '../lib/autoFetch';

function MyApp({ Component, pageProps }: AppProps) {
  const [fetchStatus, setFetchStatus] = useState<{
    loading: boolean;
    message: string | null;
  }>({
    loading: false,
    message: null,
  });

  useEffect(() => {
    // Auto-fetch trends on app load (client-side only)
    const autoFetchTrends = async () => {
      // Only attempt to fetch if we're in the browser environment
      if (typeof window === 'undefined') return;
      
      try {
        setFetchStatus({ loading: true, message: 'Checking for new trends...' });
        
        // Small delay to ensure the app is fully loaded
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { fetched, result } = await fetchIfNeeded();
        
        if (fetched && result) {
          // Set a temporary success message
          setFetchStatus({ 
            loading: false, 
            message: result.message 
          });
          
          // Clear the message after 5 seconds
          setTimeout(() => {
            setFetchStatus({ loading: false, message: null });
          }, 5000);
        } else {
          // No fetch was needed
          setFetchStatus({ loading: false, message: null });
        }
      } catch (error) {
        console.error('Error in auto-fetch:', error);
        setFetchStatus({ 
          loading: false, 
          message: `Error checking for trends: ${error instanceof Error ? error.message : String(error)}` 
        });
        
        // Clear error message after 5 seconds
        setTimeout(() => {
          setFetchStatus({ loading: false, message: null });
        }, 5000);
      }
    };

    // Run the auto-fetch with a delay to ensure the app is fully mounted
    const timer = setTimeout(() => {
      autoFetchTrends();
    }, 3000);
    
    // Set up periodic checking every 30 minutes
    const interval = setInterval(autoFetchTrends, 30 * 60 * 1000);
    
    // Clean up timers on component unmount
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <>
      {fetchStatus.message && (
        <div className={`fixed top-0 left-0 right-0 p-2 text-center text-sm font-medium z-50 ${
          fetchStatus.message.includes('Error') 
            ? 'bg-red-100 text-red-700' 
            : 'bg-green-100 text-green-700'
        }`}>
          {fetchStatus.message}
        </div>
      )}
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
