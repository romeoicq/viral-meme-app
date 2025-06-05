import { useState } from 'react';
import { ITrend } from '../models/Trend';

interface EnhanceTrendButtonProps {
  trend: ITrend;
  onSuccess?: (enhancedTrend: ITrend) => void;
}

export default function EnhanceTrendButton({ trend, onSuccess }: EnhanceTrendButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    enhanceTitle: true,
    enhanceContent: true,
    keywords: '',
    instructions: 'Make more engaging and SEO-friendly'
  });

  const enhanceTrend = async () => {
    try {
      setIsLoading(true);
      setMessage('');
      setError('');

      const response = await fetch('/api/llm/enhance-trend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          trendId: trend._id,
          options: {
            ...options,
            keywords: options.keywords.split(',').map(k => k.trim()).filter(Boolean)
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error enhancing trend');
      }

      setMessage(data.message || 'Trend enhanced successfully');
      setShowOptions(false);
      
      // Call the onSuccess callback if provided
      if (onSuccess && data.trend) {
        onSuccess(data.trend);
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setError('');
      }, 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-6">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isLoading}
        className="relative inline-flex items-center justify-center px-5 py-2.5 rounded-lg overflow-hidden 
                  group bg-gradient-to-br from-purple-600 to-indigo-600 text-white font-medium shadow-md 
                  hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 active:shadow-inner 
                  transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <span className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-white opacity-10 transform scale-0 group-hover:scale-150 group-hover:-translate-x-1 group-hover:-translate-y-1 transition-transform duration-700"></span>
        <span className="flex items-center relative z-10">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
          {isLoading ? 'Enhancing...' : 'Enhance with AI'}
        </span>
      </button>
      
      {showOptions && (
        <div className="mt-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-lg">
          <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white border-b pb-2 border-gray-200 dark:border-gray-700">
            AI Enhancement Options
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="enhance-title"
                  type="checkbox"
                  checked={options.enhanceTitle}
                  onChange={e => setOptions({...options, enhanceTitle: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="enhance-title" className="font-medium text-gray-700 dark:text-gray-300">
                  Enhance Title
                </label>
                <p className="text-gray-500 dark:text-gray-400">
                  Improve the title with SEO optimization and better engagement
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="flex items-center h-5">
                <input
                  id="enhance-content"
                  type="checkbox"
                  checked={options.enhanceContent}
                  onChange={e => setOptions({...options, enhanceContent: e.target.checked})}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="enhance-content" className="font-medium text-gray-700 dark:text-gray-300">
                  Enhance Content
                </label>
                <p className="text-gray-500 dark:text-gray-400">
                  Improve the main content with better formatting, clarity and engagement
                </p>
              </div>
            </div>
            
            <div>
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Keywords (comma separated)
              </label>
              <input
                id="keywords"
                type="text"
                value={options.keywords}
                onChange={e => setOptions({...options, keywords: e.target.value})}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm 
                          border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                placeholder="e.g., SEO, Marketing, Innovation, Digital"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Add specific keywords to target in the enhanced content
              </p>
            </div>
            
            <div>
              <label htmlFor="instructions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Instructions for AI
              </label>
              <textarea
                id="instructions"
                value={options.instructions}
                onChange={e => setOptions({...options, instructions: e.target.value})}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm
                          border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                rows={3}
                placeholder="Instructions for how the AI should enhance the content"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Provide specific instructions for the AI to follow when enhancing the content
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3 items-center">
            <button
              type="button"
              onClick={() => setShowOptions(false)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 
                        shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 
                        bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none 
                        focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={enhanceTrend}
              disabled={isLoading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm 
                        font-medium rounded-md shadow-sm text-white bg-gradient-to-r 
                        from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 
                        disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enhancing...
                </>
              ) : 'Enhance Now'}
            </button>
          </div>
        </div>
      )}
      
      {message && (
        <div className="mt-3 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-md shadow-sm flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{message}</span>
        </div>
      )}
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm flex items-center">
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
