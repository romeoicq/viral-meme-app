import { GetServerSideProps } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import TrendCard from '../components/TrendCard';
import FetchTrendHunterButton from '../components/FetchTrendHunterButton';
import { ITrend } from '../models/Trend';
import dbConnect from '../lib/db/dbConnect';
import { eventEmitter, Events } from '../lib/eventEmitter';

interface HomeProps {
  trends: ITrend[];
  categories: string[];
}

export default function Home({ trends: initialTrends, categories }: HomeProps) {
  const router = useRouter();
  const [trends, setTrends] = useState(initialTrends);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to reload trends after fetching new ones
  const reloadTrends = async () => {
    try {
      setIsLoading(true);
      const db = await dbConnect();
      const freshTrends = await db.find()
        .sort({ publishedAt: -1 })
        .limit(12)
        .exec();
      
      setTrends(freshTrends);
    } catch (error) {
      console.error('Error reloading trends:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Subscribe to the TRENDS_UPDATED event
  useEffect(() => {
    // Function to handle the TRENDS_UPDATED event
    const handleTrendsUpdated = () => {
      console.log('Trends updated event received, reloading trends');
      reloadTrends();
    };
    
    // Subscribe to the event
    const unsubscribe = eventEmitter.on(Events.TRENDS_UPDATED, handleTrendsUpdated);
    
    // Clean up the subscription when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []);

  // Filter trends based on selected category and search query
  const filteredTrends = trends
    .filter(trend => selectedCategory === 'All' || trend.category === selectedCategory)
    .filter(trend => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        trend.title.toLowerCase().includes(query) ||
        trend.summary.toLowerCase().includes(query) ||
        trend.content.toLowerCase().includes(query) ||
        (trend.tags && trend.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative mb-16 -mt-8 py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-800 z-0"></div>
        
        {/* Background patterns */}
        <div className="absolute inset-0 z-10">
          <svg className="absolute right-0 top-0 h-full w-1/2 transform translate-x-1/2 text-blue-700 opacity-20" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
          <div className="absolute left-0 bottom-0 h-16 w-16 md:h-32 md:w-32 rounded-full bg-purple-500 opacity-10"></div>
          <div className="absolute right-0 top-0 h-20 w-20 md:h-40 md:w-40 rounded-full bg-blue-400 opacity-10"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto z-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
              Discover Tomorrow's <span className="text-blue-300">Trends</span> Today
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-blue-100">
              Stay ahead with the latest insights and innovations from across the globe
            </p>
            
            {/* Search Bar */}
            <div className="mt-8 max-w-xl mx-auto">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (searchQuery.trim()) {
                    router.push({
                      pathname: '/search',
                      query: { q: searchQuery },
                    });
                  }
                }}
                className="relative rounded-full shadow-sm"
              >
                <input
                  type="text"
                  placeholder="Search the web with Brave Search..."
                  className="form-input block w-full pl-5 pr-12 py-3 border-0 rounded-full focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  type="submit" 
                  className="absolute inset-y-0 right-0 flex items-center pr-4"
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Latest Trends</h2>
          <p className="text-gray-600 dark:text-gray-400">Explore what's trending in various industries</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <FetchTrendHunterButton onSuccess={reloadTrends} />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-10 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-1 overflow-x-auto scrollbar-hide pb-1">
          <button 
            onClick={() => setSelectedCategory('All')}
            className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
              selectedCategory === 'All' 
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Categories
          </button>
          
          {/* Add all existing categories from database */}
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                selectedCategory === category 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
          
          {/* Add the two new categories if they don't already exist in the database */}
          {!categories.includes('Fashion') && (
            <button
              onClick={() => setSelectedCategory('Fashion')}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                selectedCategory === 'Fashion' 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Fashion
            </button>
          )}
          
          {!categories.includes('Celebrity News') && (
            <button
              onClick={() => setSelectedCategory('Celebrity News')}
              className={`whitespace-nowrap py-3 px-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                selectedCategory === 'Celebrity News' 
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Celebrity News
            </button>
          )}
        </nav>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading fresh trends...</p>
        </div>
      ) : (
        <>
          {filteredTrends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredTrends.map(trend => (
                <TrendCard key={trend._id} trend={trend} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
              <svg className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No trends found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchQuery 
                  ? `No results matching "${searchQuery}" in ${selectedCategory !== 'All' ? `the ${selectedCategory} category` : 'any category'}.` 
                  : `No trends found in ${selectedCategory !== 'All' ? `the ${selectedCategory} category` : 'any category'}.`}
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => {
                    setSelectedCategory('All');
                    setSearchQuery('');
                  }}
                  className="px-4 py-2 rounded-md bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition-colors duration-200"
                >
                  Reset filters
                </button>
                <FetchTrendHunterButton onSuccess={reloadTrends} />
              </div>
            </div>
          )}
          
          {filteredTrends.length > 0 && filteredTrends.length < 3 && (
            <div className="flex justify-center mt-8">
              <button 
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                See all trends →
              </button>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const db = await dbConnect();
  
  // Get all trends, sorted by date
  const trends = await db.find()
    .sort({ publishedAt: -1 })
    .limit(12)
    .exec();
  
  // Get all unique categories
  const categories = await db.distinct('category');
  
  return {
    props: {
      trends: JSON.parse(JSON.stringify(trends)),
      categories: JSON.parse(JSON.stringify(categories)),
    },
  };
};
