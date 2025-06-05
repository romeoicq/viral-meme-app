import { NextApiRequest, NextApiResponse } from 'next';
import { parseTrendHunterFeed } from '../../lib/parsers/xmlFeedParser';
import { mockDb } from '../../lib/db/mockDb';
import { ITrend } from '../../models/Trend';

// TrendHunter RSS feed URL
const TRENDHUNTER_FEED_URL = 'https://www.trendhunter.com/rss/feed';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Fetching trends from TrendHunter RSS feed...');
    
    // Parse the TrendHunter feed
    const trends = await parseTrendHunterFeed(TRENDHUNTER_FEED_URL);

    // If no trends were found, return an error
    if (!trends || trends.length === 0) {
      return res.status(404).json({ message: 'No trends found in feed' });
    }

    console.log(`Successfully parsed ${trends.length} trends from TrendHunter`);
    
    // Store the trends in the mock database (for persistence during the session)
    let addedCount = 0;
    for (const trend of trends) {
      // Only add if not already in the database (check by slug)
      const existingTrend = await mockDb.findOne({ slug: trend.slug });
      if (!existingTrend) {
        await mockDb.create(trend);
        addedCount++;
      }
    }

    // Return success
    return res.status(200).json({ 
      success: true, 
      total: trends.length,
      added: addedCount,
      message: `Successfully fetched ${trends.length} trends, added ${addedCount} new trends.`
    });
  } catch (error) {
    console.error('Error in fetchTrendHunterFeed API:', error);
    return res.status(500).json({ 
      message: 'Error fetching trends', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
