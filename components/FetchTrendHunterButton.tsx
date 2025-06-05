import { useState } from 'react';

interface FetchTrendHunterButtonProps {
  onSuccess?: () => void;
}

export default function FetchTrendHunterButton({ onSuccess }: FetchTrendHunterButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchTrendHunterData = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      const response = await fetch('/api/fetchTrendHunterFeed');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error fetching trends');
      }

      setMessage(data.message);
      
      // Call the onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Clear the success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Clear the error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={fetchTrendHunterData}
        disabled={isLoading}
        className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg overflow-hidden group bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 active:shadow-inner transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-white opacity-10 transform scale-0 group-hover:scale-150 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-700"></span>
        <span className="flex items-center relative z-10">
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Refreshing trends...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh trends
            </>
          )}
        </span>
      </button>
      
      {message && (
        <div className="absolute top-full left-0 right-0 mt-2 transform transition-all duration-300 ease-out opacity-100">
          <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 rounded shadow-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{message}</span>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 transform transition-all duration-300 ease-out opacity-100">
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 rounded shadow-md flex items-center">
            <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
