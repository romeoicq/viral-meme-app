import { NextApiRequest, NextApiResponse } from 'next';
import { problemDb } from '../../../lib/db/problemDb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Fetching high-priority problems...');

    // Get high priority problems (urgency >= 7 AND opportunity >= 7)
    const highPriorityProblems = await problemDb.findHighPriority();

    // Also get problems with very high individual scores
    const allProblems = await problemDb.find();
    const criticalProblems = allProblems.filter(p => 
      p.urgencyScore >= 9 || p.opportunityScore >= 9
    );

    // Combine and deduplicate
    const combinedProblems = [...highPriorityProblems];
    
    criticalProblems.forEach(problem => {
      if (!combinedProblems.find(p => p._id === problem._id)) {
        combinedProblems.push(problem);
      }
    });

    // Sort by combined score (urgency + opportunity)
    combinedProblems.sort((a, b) => {
      const scoreA = a.urgencyScore + a.opportunityScore;
      const scoreB = b.urgencyScore + b.opportunityScore;
      return scoreB - scoreA;
    });

    // Limit to top 20
    const topProblems = combinedProblems.slice(0, 20);

    // Get stats for context
    const stats = await problemDb.getStats();

    return res.status(200).json({
      success: true,
      problems: topProblems,
      count: topProblems.length,
      stats: {
        totalProblems: stats.total,
        avgUrgency: stats.avgUrgency,
        avgOpportunity: stats.avgOpportunity,
        highPriorityCount: topProblems.length
      },
      criteria: {
        highPriority: 'Urgency >= 7 AND Opportunity >= 7',
        critical: 'Urgency >= 9 OR Opportunity >= 9'
      }
    });

  } catch (error) {
    console.error('Error fetching high-priority problems:', error);
    return res.status(500).json({
      message: 'Error fetching high-priority problems',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
