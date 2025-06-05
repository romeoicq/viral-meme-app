import { NextApiRequest, NextApiResponse } from 'next';
import { redditCollector } from '../../../lib/collectors/redditCollector';
import { freeDataCollector } from '../../../lib/collectors/freeDataCollector';
import { expandedQACollector } from '../../../lib/collectors/expandedQACollector';
import { problemDb } from '../../../lib/db/problemDb';
import { IProblem } from '../../../models/Problem';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('Starting problem collection process...');
    
    const { platforms, keywords, categories } = req.body;
    
    // Default configuration if not provided
    const defaultKeywords = ['api', 'integration', 'automation', 'workflow', 'saas', 'database', 'performance'];
    const defaultCategories = ['Technology', 'Business'];
    
    const usedKeywords = keywords || defaultKeywords;
    const usedCategories = categories || defaultCategories;
    const usedPlatforms = platforms || ['reddit'];

    let allProblems: IProblem[] = [];
    
    // Collect from Free Sources (Stack Overflow RSS, GitHub, Hacker News, Dev.to)
    console.log('Collecting problems from free sources...');
    try {
      const freeProblems = await freeDataCollector.collectFromFreeSources();
      console.log(`Found ${freeProblems.length} problems from free sources`);
      allProblems = [...allProblems, ...freeProblems];
    } catch (error) {
      console.error('Error collecting from free sources:', error);
    }
    
    // Collect from Reddit
    if (usedPlatforms.includes('reddit')) {
      console.log('Collecting problems from Reddit...');
      const subreddits = ['entrepreneur', 'smallbusiness', 'productivity', 'webdev', 'programming', 'startups'];
      
      try {
        const redditProblems = await redditCollector.collectProblems(subreddits, usedKeywords);
        console.log(`Found ${redditProblems.length} problems from Reddit`);
        allProblems = [...allProblems, ...redditProblems];
      } catch (error) {
        console.error('Error collecting from Reddit:', error);
      }
    }

    // TODO: Add Stack Exchange collector here when implemented
    // if (usedPlatforms.includes('stackoverflow')) {
    //   const sites = ['stackoverflow', 'superuser'];
    //   const stackProblems = await stackCollector.collectProblems(sites, usedKeywords);
    //   allProblems = [...allProblems, ...stackProblems];
    // }

    // Store problems in database
    let addedCount = 0;
    let updatedCount = 0;
    
    for (const problem of allProblems) {
      try {
        // Check if problem already exists (by platformId and platform)
        const existingProblem = await problemDb.findOne({ 
          platformId: problem.platformId,
          platform: problem.platform 
        });
        
        if (!existingProblem) {
          await problemDb.create(problem);
          addedCount++;
        } else {
          // Update existing problem with new engagement metrics
          await problemDb.update(existingProblem._id!, {
            engagementMetrics: problem.engagementMetrics,
            lastAnalyzed: new Date()
          });
          updatedCount++;
        }
      } catch (error) {
        console.error('Error storing problem:', error);
      }
    }

    console.log(`Collection complete: ${addedCount} new, ${updatedCount} updated`);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      total: allProblems.length,
      added: addedCount,
      updated: updatedCount,
      platforms: usedPlatforms,
      keywords: usedKeywords,
      message: `Successfully collected ${allProblems.length} problems from FREE sources (Stack Overflow, GitHub, Hacker News, Dev.to), added ${addedCount} new, updated ${updatedCount} existing.`
    });
    
  } catch (error) {
    console.error('Error in collect API:', error);
    return res.status(500).json({ 
      message: 'Error collecting problems', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}
