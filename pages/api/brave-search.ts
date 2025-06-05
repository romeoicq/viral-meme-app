import type { NextApiRequest, NextApiResponse } from 'next';

// Define the response type for Brave Search
type BraveSearchResponse = {
  web?: {
    results: Array<{
      title: string;
      url: string;
      description: string;
      age?: string;
      image?: {
        url: string;
      };
    }>;
    total?: number;
  };
  error?: string;
};

type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BraveSearchResponse | ErrorResponse>
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { q } = req.query;
  
  // Check if query parameter is provided
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  try {
    // You would need to get an API key from Brave Search
    // https://brave.com/search/api/
    const BRAVE_API_KEY = process.env.BRAVE_API_KEY;
    
    if (!BRAVE_API_KEY) {
      return res.status(500).json({ error: 'Brave Search API key is not configured' });
    }

    // Call Brave Search API
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(q)}&count=10`, {
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': BRAVE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`Brave Search API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching from Brave Search:', error);
    return res.status(500).json({ error: 'Failed to fetch results from Brave Search' });
  }
}
