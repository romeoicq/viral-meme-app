import type { NextApiRequest, NextApiResponse } from 'next';

// Cache for real-time memes (15 minute cache for ultra-fresh content)
let realtimeMemesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

interface MemeApiMeme {
  postLink: string;
  subreddit: string;
  title: string;
  url: string; // This is the image URL
  nsfw: boolean;
  spoiler: boolean;
  author: string;
  ups: number;
  preview: string[];
}

interface ProcessedMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  shareCount: number;
  isViral: boolean;
  category: 'all' | 'viral' | 'fresh';
  processedAt: number;
  source: string;
  publishDate: string; // Placeholder, as meme-api doesn't provide it
  upvotes: number;
  comments: number; // Placeholder
  timeAgo: string; // Placeholder
  redditUrl: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const forceRefresh = req.query.refresh === 'true';
    
    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && realtimeMemesCache && (now - realtimeMemesCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({ 
        memes: realtimeMemesCache.data,
        cached: true,
        lastUpdated: new Date(realtimeMemesCache.timestamp).toISOString(),
        source: 'meme-api.com'
      });
    }

    console.log('🔄 Fetching fresh memes from meme-api.com...');
    
    const memeApiUrl = 'https://meme-api.com/gimme/20'; // Fetch 20 random memes
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(memeApiUrl)}`;

    const response = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
      },
      method: 'GET',
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(8000) // 8 second timeout
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch from meme-api.com: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.memes || data.memes.length === 0) {
      throw new Error('No memes found in meme-api.com response');
    }

    const processedMemes: ProcessedMeme[] = data.memes
      .filter((meme: MemeApiMeme) => !meme.nsfw && !meme.spoiler) // Filter out NSFW/spoiler content
      .map((meme: MemeApiMeme) => ({
        id: meme.url.split('/').pop() || meme.title.replace(/\s/g, '-').toLowerCase(), // Generate ID from URL or title
        name: meme.title.substring(0, 100), // Limit title length
        url: meme.url,
        width: 800, // Default width
        height: 600, // Default height
        shareCount: meme.ups || Math.floor(Math.random() * 50000) + 1000, // Use ups or generate
        isViral: (meme.ups || 0) > 5000, // Define viral threshold
        category: (meme.ups || 0) > 5000 ? 'viral' : 'fresh', // Categorize based on upvotes
        processedAt: Date.now(),
        source: `r/${meme.subreddit}`,
        publishDate: new Date().toISOString(), // Placeholder
        upvotes: meme.ups || 0,
        comments: Math.floor(Math.random() * 500), // Generate random comments
        timeAgo: `${Math.floor(Math.random() * 24) + 1}h ago`, // Generate random time ago
        redditUrl: meme.postLink
      }));

    // Update cache
    realtimeMemesCache = {
      data: processedMemes,
      timestamp: now
    };
    
    console.log(`✅ Processed ${processedMemes.length} fresh memes from meme-api.com`);
    
    res.status(200).json({ 
      memes: processedMemes,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      source: 'meme-api.com',
      totalFetched: processedMemes.length,
      freshCount: processedMemes.filter(m => m.category === 'fresh').length,
      viralCount: processedMemes.filter(m => m.isViral).length
    });
    
  } catch (error) {
    console.error('❌ Error fetching fresh memes from meme-api.com:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fresh memes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
