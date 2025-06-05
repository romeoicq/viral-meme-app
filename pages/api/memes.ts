import type { NextApiRequest, NextApiResponse } from 'next';

interface ImgflipMeme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  captions?: number;
}

interface ImgflipResponse {
  success: boolean;
  data: {
    memes: ImgflipMeme[];
  };
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
}

// Cache to store memes for 5 minutes
let memesCache: { data: ProcessedMeme[]; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const useRealtime = req.query.source === 'realtime';
    
    if (useRealtime) {
      // Use the real-time Reddit collector for actual recent memes
      const realtimeResponse = await fetch(`${req.headers.origin || 'http://localhost:3000'}/api/memes/realtime`);
      
      if (realtimeResponse.ok) {
        const realtimeData = await realtimeResponse.json();
        return res.status(200).json({
          memes: realtimeData.memes,
          cached: realtimeData.cached,
          source: 'realtime',
          lastUpdated: realtimeData.lastUpdated,
          freshCount: realtimeData.freshCount,
          viralCount: realtimeData.viralCount
        });
      }
      // Fall through to Imgflip if realtime fails
    }
    // Check cache first
    const now = Date.now();
    if (memesCache && (now - memesCache.timestamp) < CACHE_DURATION) {
      return res.status(200).json({ 
        memes: memesCache.data,
        cached: true 
      });
    }

    // Fetch from Imgflip API
    const response = await fetch('https://api.imgflip.com/get_memes');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ImgflipResponse = await response.json();
    
    if (!data.success) {
      throw new Error('API returned unsuccessful response');
    }

    // Process and enhance meme data
    const processedMemes = processMemes(data.data.memes);
    
    // Update cache
    memesCache = {
      data: processedMemes,
      timestamp: now
    };
    
    res.status(200).json({ 
      memes: processedMemes,
      cached: false 
    });
    
  } catch (error) {
    console.error('Error fetching memes:', error);
    
    // Return fallback memes if API fails
    const fallbackMemes = getFallbackMemes();
    
    res.status(200).json({ 
      memes: fallbackMemes,
      fallback: true 
    });
  }
}

function processMemes(rawMemes: ImgflipMeme[]): ProcessedMeme[] {
  return rawMemes.map((meme) => ({
    id: meme.id,
    name: meme.name,
    url: meme.url,
    width: meme.width,
    height: meme.height,
    shareCount: generateShareCount(meme.captions || 0),
    isViral: (meme.captions || 0) > 500000,
    category: categorize(meme.name),
    processedAt: Date.now()
  }));
}

function generateShareCount(captions: number): number {
  // Convert captions to shares (roughly 1:10 ratio)
  const baseShares = Math.floor(captions / 10);
  // Add some randomness
  const variation = Math.floor(Math.random() * 1000);
  return Math.max(100, baseShares + variation);
}

function categorize(name: string): 'all' | 'viral' | 'fresh' {
  const viral = ['Drake', 'Distracted Boyfriend', 'Two Buttons', 'Expanding Brain'];
  const fresh = ['Always Has Been', 'Trade Offer', 'Buff Doge'];
  
  if (viral.some(keyword => name.includes(keyword))) return 'viral';
  if (fresh.some(keyword => name.includes(keyword))) return 'fresh';
  return 'all';
}

function getFallbackMemes(): ProcessedMeme[] {
  return [
    {
      id: '181913649',
      name: 'Drake Hotline Bling',
      url: 'https://i.imgflip.com/30b1gx.jpg',
      width: 1200,
      height: 1200,
      shareCount: 45230,
      isViral: true,
      category: 'viral',
      processedAt: Date.now()
    },
    {
      id: '87743020',
      name: 'Two Buttons',
      url: 'https://i.imgflip.com/1g8my4.jpg',
      width: 600,
      height: 908,
      shareCount: 32150,
      isViral: true,
      category: 'viral',
      processedAt: Date.now()
    },
    {
      id: '112126428',
      name: 'Distracted Boyfriend',
      url: 'https://i.imgflip.com/1ur9b0.jpg',
      width: 1200,
      height: 800,
      shareCount: 38920,
      isViral: true,
      category: 'viral',
      processedAt: Date.now()
    },
    {
      id: '61579',
      name: 'One Does Not Simply',
      url: 'https://i.imgflip.com/1bij.jpg',
      width: 568,
      height: 335,
      shareCount: 28450,
      isViral: true,
      category: 'viral',
      processedAt: Date.now()
    },
    {
      id: '101470',
      name: 'Ancient Aliens',
      url: 'https://i.imgflip.com/26am.jpg',
      width: 500,
      height: 437,
      shareCount: 19820,
      isViral: false,
      category: 'fresh',
      processedAt: Date.now()
    },
    {
      id: '124822590',
      name: 'Left Exit 12 Off Ramp',
      url: 'https://i.imgflip.com/22bdq6.jpg',
      width: 804,
      height: 767,
      shareCount: 15340,
      isViral: false,
      category: 'fresh',
      processedAt: Date.now()
    }
  ];
}
