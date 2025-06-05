import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import Head from 'next/head';

type SearchResult = {
  title: string;
  url: string;
  description: string;
  age?: string;
  image?: {
    url: string;
  };
};

interface SearchProps {
  initialResults: SearchResult[];
  query: string;
  totalResults?: number;
  error?: string;
}

export default function Search({ initialResults, query, totalResults, error }: SearchProps) {
  const router = useRouter();
  const [results, setResults] = useState(initialResults);
  const [searchQuery, setSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);

  // Update search query when URL changes
  useEffect(() => {
    if (router.query.q && typeof router.query.q === 'string') {
      setSearchQuery(router.query.q);
    }
  }, [router.query.q]);

  // Handle search submission
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    router.push({
      pathname: '/search',
      query: { q: searchQuery },
    });
  };

  return (
    <Layout>
      <Head>
        <title>{searchQuery ? `${searchQuery} - Brave Search` : 'Brave Search'}</title>
      </Head>

      {/* Search Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 py-4 mb-6">
        <div className="container mx-auto px-4">
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto flex">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the web..."
              className="flex-grow form-input rounded-l-lg border-r-0 focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-4">
        {/* Results count */}
        {!error && results.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
            About {totalResults?.toLocaleString() || results.length} results
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Search Error
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      onClick={() => router.push('/')}
                      className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 dark:text-red-200 hover:bg-red-100 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Go home
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Results list */}
        {!isLoading && !error && results.length > 0 ? (
          <div className="space-y-8 max-w-3xl">
            {results.map((result, index) => (
              <div key={index} className="group">
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block hover:no-underline"
                >
                  {result.image?.url && (
                    <div className="mb-2 overflow-hidden rounded">
                      <img 
                        src={result.image.url} 
                        alt=""
                        className="w-full h-32 object-cover transition duration-300 transform group-hover:scale-105" 
                      />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1">
                      {new URL(result.url).hostname}
                    </p>
                    <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 group-hover:underline mb-2">
                      {result.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-2">
                      {result.description}
                    </p>
                    {result.age && (
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">
                        {result.age}
                      </p>
                    )}
                  </div>
                </a>
              </div>
            ))}
          </div>
        ) : !isLoading && !error ? (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">No results found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Try different keywords or go back to home.
            </p>
            <div className="mt-6">
              <Link href="/">
                <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  Back to Home
                </a>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const searchQuery = query.q as string;

  // If no query provided, redirect to home
  if (!searchQuery) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  try {
    // Create absolute URL for API call (will work in both dev and production)
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const host = process.env.VERCEL_URL || 'localhost:3000';
    const apiUrl = `${protocol}://${host}/api/brave-search?q=${encodeURIComponent(searchQuery)}`;
    
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch search results');
    }

    return {
      props: {
        initialResults: data.web?.results || [],
        query: searchQuery,
        totalResults: data.web?.total || 0,
      },
    };
  } catch (error: any) {
    console.error('Error fetching search results:', error);
    
    return {
      props: {
        initialResults: [],
        query: searchQuery,
        error: error.message || 'Failed to fetch search results. Please try again later.',
      },
    };
  }
};
