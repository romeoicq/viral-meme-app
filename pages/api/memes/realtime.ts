import type { NextApiRequest, NextApiResponse } from 'next';
import { realTimeMemeCollector } from '../../../lib/realTimeMemeCollector';

// Cache for real-time memes (15 minute cache for ultra-fresh content)
let realtimeMemesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

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
        source: 'reddit-realtime'
      });
    }

    console.log('🔄 Fetching real-time memes from Reddit...');
    
    // Fetch from real-time collector
    const recentMemes = await realTimeMemeCollector.fetchRecentMemes();
    
    // Convert to expected format for the frontend
    const processedMemes = recentMemes.map(meme => ({
      id: meme.id,
      name: meme.title,
      url: meme.imageUrl,
      width: 800,
      height: 600,
      shareCount: meme.upvotes,
      isViral: meme.isViral,
      category: meme.category,
      processedAt: Date.now(),
      source: meme.source,
      publishDate: meme.publishDate,
      upvotes: meme.upvotes,
      comments: meme.comments,
      timeAgo: realTimeMemeCollector.getTimeSincePosted(meme.publishDate),
      redditUrl: meme.url
    }));

    // Update cache
    realtimeMemesCache = {
      data: processedMemes,
      timestamp: now
    };
    
    console.log(`✅ Processed ${processedMemes.length} real-time memes`);
    
    res.status(200).json({ 
      memes: processedMemes,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      source: 'reddit-realtime',
      totalFetched: processedMemes.length,
      freshCount: processedMemes.filter(m => m.category === 'fresh').length,
      viralCount: processedMemes.filter(m => m.isViral).length
    });
    
  } catch (error) {
    console.error('Error fetching real-time memes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch real-time memes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
