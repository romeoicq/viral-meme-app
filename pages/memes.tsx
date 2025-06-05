import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { MemeCard } from '../components/MemeCard';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { StatusBar } from '../components/StatusBar';

interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  shareCount: number;
  isViral: boolean;
  category: 'all' | 'viral' | 'fresh';
  processedAt: number;
  timeAgo?: string;
  source?: string;
  redditUrl?: string;
}

const CATEGORIES = [
  { id: 'all', label: 'Best Memes', icon: '⭐' },
  { id: 'viral', label: 'Hot Memes', icon: '🔥' },
  { id: 'fresh', label: 'New Memes', icon: '⚡' }
] as const;

export default function MemesPage() {
  const router = useRouter();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [filteredMemes, setFiltered] = useState<Meme[]>([]);
  const [currentCategory, setCurrentCategory] = useState<'all' | 'viral' | 'fresh'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('Loading fresh memes...');
  const [shareCount, setShareCount] = useState(0);

  // Load memes from API based on URL parameter
  const loadMemes = useCallback(async () => {
    setIsLoading(true);
    
    // Get source from URL parameter
    const source = router.query.source as string;
    
    let apiUrl = '/api/memes';
    let statusMsg = 'Loading memes...';
    
    if (source === 'realtime') {
      apiUrl = '/api/memes/realtime';
      statusMsg = '🔄 Loading real-time memes from Reddit...';
    } else if (source === 'fresh') {
      apiUrl = '/api/memes/fresh';
      statusMsg = '⚡ Loading fresh daily memes...';
    } else if (source === 'aggregate') {
      apiUrl = '/api/memes/aggregate';
      statusMsg = '📊 Loading aggregated memes...';
    } else {
      statusMsg = '🎯 Loading classic memes...';
    }
    
    setStatusMessage(statusMsg);
    
    try {
      console.log(`🚀 Fetching from: ${apiUrl}`);
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch memes');
      
      const data = await response.json();
      console.log(`✅ Loaded ${data.memes?.length || 0} memes`);
      
      setMemes(data.memes || []);
      
      if (source === 'realtime') {
        setStatusMessage(`✅ Real-time memes loaded! ${data.freshCount || 0} fresh, ${data.viralCount || 0} viral`);
      } else {
        setStatusMessage('✅ Memes loaded successfully!');
      }
    } catch (error) {
      console.error('Failed to load memes:', error);
      setStatusMessage('❌ Failed to load memes - retrying...');
      
      // No fallback memes - show error message instead
      setMemes([]);
      
      // Retry after 3 seconds
      setTimeout(() => {
        loadMemes();
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  }, [router.query.source]);

  // Filter memes by category
  useEffect(() => {
    if (currentCategory === 'all') {
      setFiltered(memes);
    } else if (currentCategory === 'viral') {
      setFiltered(memes.filter(meme => meme.isViral));
    } else if (currentCategory === 'fresh') {
      setFiltered(memes.slice(0, 20));
    }
  }, [memes, currentCategory]);

  // Load memes when router is ready
  useEffect(() => {
    if (router.isReady) {
      loadMemes();
    }
  }, [router.isReady, loadMemes]);

  // Load share count from localStorage
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('memeviralStats');
    if (stored) {
      try {
        const stats = JSON.parse(stored);
        const todayStats = stats[today];
        if (todayStats) {
          setShareCount(todayStats.total || 0);
        }
      } catch (error) {
        console.error('Failed to load share stats:', error);
      }
    }
  }, []);

  const handleShare = useCallback((memeId: string, platform: string) => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('memeviralStats') || '{}';
    
    try {
      const stats = JSON.parse(stored);
      if (!stats[today]) {
        stats[today] = { total: 0, platforms: {} };
      }
      
      stats[today].total++;
      stats[today].platforms[platform] = (stats[today].platforms[platform] || 0) + 1;
      
      localStorage.setItem('memeviralStats', JSON.stringify(stats));
      setShareCount(stats[today].total);
      
      // Update meme share count in state
      setMemes(prev => prev.map(meme => 
        meme.id === memeId 
          ? { ...meme, shareCount: meme.shareCount + Math.floor(Math.random() * 5) + 1 }
          : meme
      ));
    } catch (error) {
      console.error('Failed to update share stats:', error);
    }
  }, []);

  const refreshMemes = () => {
    loadMemes();
  };

  // Get page title based on source
  const getPageTitle = () => {
    const source = router.query.source as string;
    if (source === 'realtime') return 'MemeViral - Live Reddit Memes';
    if (source === 'fresh') return 'MemeViral - Fresh Daily Memes';
    if (source === 'aggregate') return 'MemeViral - Aggregated Memes';
    return 'MemeViral - Fresh Memes Daily';
  };

  return (
    <>
      <Head>
        <title>{getPageTitle()}</title>
        <meta name="description" content="The best viral memes delivered daily. Share, laugh, and spread the fun!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 text-white">
        {/* Header */}
        <header className="flex justify-between items-center p-5 bg-white bg-opacity-10 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-orange-400 rounded-full flex items-center justify-center text-2xl">
              😆
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-white via-pink-200 to-orange-200 bg-clip-text text-transparent drop-shadow-lg">
                MemeViral
              </h1>
              <p className="text-sm opacity-80">
                {router.query.source === 'realtime' ? 'Live Reddit memes' : 'Fresh memes delivered daily'}
              </p>
            </div>
          </div>
          <button
            onClick={refreshMemes}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 px-5 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
          >
            🔄 Refresh
          </button>
        </header>

        {/* Status Bar */}
        <StatusBar 
          statusMessage={statusMessage}
          shareCount={shareCount}
        />

        {/* Navigation Tabs */}
        <nav className="flex justify-center gap-3 p-5">
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setCurrentCategory(category.id)}
              className={`px-8 py-4 rounded-full text-sm font-medium min-w-[140px] transition-all duration-300 flex items-center justify-center gap-2 text-white ${
                currentCategory === category.id
                  ? 'bg-white bg-opacity-30 -translate-y-1'
                  : 'bg-white bg-opacity-20 hover:bg-opacity-30 hover:-translate-y-1'
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Main Content */}
        <main className="px-5 pb-10 max-w-6xl mx-auto">
          {isLoading ? (
            <LoadingSpinner message="Curating the funniest content for you..." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
              {filteredMemes.map((meme) => (
                <MemeCard
                  key={meme.id}
                  meme={meme}
                  onShare={handleShare}
                />
              ))}
            </div>
          )}
          
          {/* Show meme count and source info */}
          {!isLoading && filteredMemes.length > 0 && (
            <div className="text-center mt-8 text-sm opacity-70">
              <p>Showing {filteredMemes.length} memes</p>
              {router.query.source === 'realtime' && (
                <p className="mt-2">🔴 Live from Reddit • Updated every 15 minutes</p>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
