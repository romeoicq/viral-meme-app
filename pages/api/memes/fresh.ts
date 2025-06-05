import type { NextApiRequest, NextApiResponse } from 'next';
import { simpleMemeCollector } from '../../../lib/simpleMemeCollector';

// Cache for fresh memes (30 minute cache for fresh content)
let freshMemesCache: { data: any[]; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

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
    if (!forceRefresh && freshMemesCache && (now - freshMemesCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({ 
        memes: freshMemesCache.data,
        cached: true,
        lastUpdated: new Date(freshMemesCache.timestamp).toISOString(),
        source: 'fresh-collector'
      });
    }

    console.log('🔄 Fetching fresh memes with recent content...');
    
    // Fetch from simple collector
    const freshMemes = await simpleMemeCollector.fetchRecentMemes();
    
    // Convert to expected format for the frontend
    const processedMemes = freshMemes.map(meme => ({
      id: meme.id,
      name: meme.name,
      url: meme.url,
      width: meme.width,
      height: meme.height,
      shareCount: meme.shareCount,
      isViral: meme.isViral,
      category: meme.category,
      processedAt: meme.processedAt,
      source: meme.source,
      publishDate: meme.publishDate
    }));

    // Update cache
    freshMemesCache = {
      data: processedMemes,
      timestamp: now
    };
    
    console.log(`✅ Processed ${processedMemes.length} fresh memes`);
    
    res.status(200).json({ 
      memes: processedMemes,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      source: 'fresh-collector',
      totalFetched: processedMemes.length
    });
    
  } catch (error) {
    console.error('Error fetching fresh memes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch fresh memes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
