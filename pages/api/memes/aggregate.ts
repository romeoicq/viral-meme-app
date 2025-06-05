import type { NextApiRequest, NextApiResponse } from 'next';
import { memeAggregator, type FetchedMeme } from '../../../lib/memeAggregator';

interface AggregatedMeme {
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
  originalUrl: string;
  publishDate: string;
  tags: string[];
}

// Cache for aggregated memes (24 hour cache)
let aggregatedMemesCache: { data: AggregatedMeme[]; timestamp: number } | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGet(req, res);
  } else if (req.method === 'POST') {
    return handlePost(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const forceRefresh = req.query.refresh === 'true';
    
    // Check cache first (unless force refresh)
    const now = Date.now();
    if (!forceRefresh && aggregatedMemesCache && (now - aggregatedMemesCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({ 
        memes: aggregatedMemesCache.data,
        cached: true,
        lastUpdated: new Date(aggregatedMemesCache.timestamp).toISOString(),
        sources: memeAggregator.getSources()
      });
    }

    console.log('🔄 Fetching fresh memes from all sources...');
    
    // Fetch from all sources
    const fetchedMemes = await memeAggregator.fetchAllSources();
    
    // Convert to our meme format
    const processedMemes = await Promise.all(
      fetchedMemes.map(async (meme) => await processFetchedMeme(meme))
    );
    
    // Filter out invalid memes and sort
    const validMemes = processedMemes
      .filter(meme => meme !== null)
      .sort((a, b) => b.shareCount - a.shareCount)
      .slice(0, 100); // Limit to top 100

    // Update cache
    aggregatedMemesCache = {
      data: validMemes,
      timestamp: now
    };
    
    console.log(`✅ Processed ${validMemes.length} memes from aggregation`);
    
    res.status(200).json({ 
      memes: validMemes,
      cached: false,
      lastUpdated: new Date(now).toISOString(),
      sources: memeAggregator.getSources(),
      totalFetched: fetchedMemes.length
    });
    
  } catch (error) {
    console.error('Error in meme aggregation:', error);
    res.status(500).json({ 
      error: 'Failed to aggregate memes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { action, sourceId, updates } = req.body;
    
    if (action === 'updateSource' && sourceId && updates) {
      memeAggregator.updateSource(sourceId, updates);
      
      // Clear cache to force refresh
      aggregatedMemesCache = null;
      
      return res.status(200).json({ 
        success: true,
        message: 'Source updated successfully',
        sources: memeAggregator.getSources()
      });
    }
    
    res.status(400).json({ error: 'Invalid action or missing parameters' });
    
  } catch (error) {
    console.error('Error updating meme sources:', error);
    res.status(500).json({ 
      error: 'Failed to update sources',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function processFetchedMeme(fetchedMeme: FetchedMeme): Promise<AggregatedMeme | null> {
  try {
    // Get image dimensions (basic estimation)
    const dimensions = await getImageDimensions(fetchedMeme.imageUrl);
    
    // Calculate viral status and share count
    const isViral = calculateViralStatus(fetchedMeme);
    const shareCount = calculateShareCount(fetchedMeme);
    const category = determineCategory(fetchedMeme, isViral);
    
    return {
      id: fetchedMeme.id,
      name: fetchedMeme.title,
      url: fetchedMeme.imageUrl,
      width: dimensions.width,
      height: dimensions.height,
      shareCount: shareCount,
      isViral: isViral,
      category: category,
      processedAt: Date.now(),
      source: fetchedMeme.source,
      originalUrl: fetchedMeme.url,
      publishDate: fetchedMeme.publishDate.toISOString(),
      tags: fetchedMeme.tags || []
    };
  } catch (error) {
    console.warn('Error processing meme:', fetchedMeme.id, error);
    return null;
  }
}

async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  // Default dimensions - in a real app you might want to fetch actual dimensions
  // This is a simplified version to avoid making too many HTTP requests
  return { width: 500, height: 400 };
}

function calculateViralStatus(meme: FetchedMeme): boolean {
  const upvotes = meme.upvotes || 0;
  const daysSincePublish = Math.max(1, (Date.now() - meme.publishDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Consider viral if high upvotes relative to age
  const viralThreshold = 1000 / daysSincePublish;
  return upvotes > viralThreshold;
}

function calculateShareCount(meme: FetchedMeme): number {
  const baseScore = meme.upvotes || 0;
  
  // Convert upvotes to estimated shares with some randomness
  const estimatedShares = Math.floor(baseScore * (0.1 + Math.random() * 0.2));
  
  // Add some base shares and random variation
  const minShares = 100;
  const randomBoost = Math.floor(Math.random() * 1000);
  
  return Math.max(minShares, estimatedShares + randomBoost);
}

function determineCategory(meme: FetchedMeme, isViral: boolean): 'all' | 'viral' | 'fresh' {
  if (isViral) return 'viral';
  
  // Consider fresh if published within last 24 hours
  const hoursOld = (Date.now() - meme.publishDate.getTime()) / (1000 * 60 * 60);
  if (hoursOld < 24) return 'fresh';
  
  return 'all';
}
