import { NextApiRequest, NextApiResponse } from 'next';
import { problemDb } from '../../../lib/db/problemDb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Allow both GET and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Extract filters from query params (GET) or body (POST)
    const filters = req.method === 'GET' ? req.query : req.body;
    
    const {
      category = 'all',
      platform = 'all',
      urgencyMin = 1,
      opportunityMin = 1,
      status = 'all',
      search = '',
      limit = 50,
      offset = 0
    } = filters;

    console.log('Searching problems with filters:', filters);

    // Build query object
    const query: any = {};
    
    if (category !== 'all') {
      query.category = category;
    }
    
    if (platform !== 'all') {
      query.platform = platform;
    }
    
    if (status !== 'all') {
      query.status = status;
    }

    // Get all problems matching basic filters
    let problems = await problemDb.find(query);

    // Apply additional filters
    problems = problems.filter(problem => {
      // Urgency filter
      if (problem.urgencyScore < parseInt(String(urgencyMin))) return false;
      
      // Opportunity filter
      if (problem.opportunityScore < parseInt(String(opportunityMin))) return false;
      
      // Search filter (title, description, tags)
      if (search && search.length > 0) {
        const searchTerm = String(search).toLowerCase();
        const searchableText = `${problem.title} ${problem.description} ${problem.tags.join(' ')}`.toLowerCase();
        if (!searchableText.includes(searchTerm)) return false;
      }
      
      return true;
    });

    // Sort by combined urgency + opportunity score (highest first)
    problems.sort((a, b) => {
      const scoreA = a.urgencyScore + a.opportunityScore;
      const scoreB = b.urgencyScore + b.opportunityScore;
      return scoreB - scoreA;
    });

    // Apply pagination
    const startIndex = parseInt(String(offset));
    const limitNum = parseInt(String(limit));
    const paginatedProblems = problems.slice(startIndex, startIndex + limitNum);

    // Get statistics
    const stats = await problemDb.getStats();

    return res.status(200).json({
      success: true,
      problems: paginatedProblems,
      total: problems.length,
      offset: startIndex,
      limit: limitNum,
      hasMore: startIndex + limitNum < problems.length,
      stats: stats,
      filters: {
        category,
        platform,
        urgencyMin,
        opportunityMin,
        status,
        search
      }
    });

  } catch (error) {
    console.error('Error searching problems:', error);
    return res.status(500).json({
      message: 'Error searching problems',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
