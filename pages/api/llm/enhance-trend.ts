import { NextApiRequest, NextApiResponse } from 'next';
import { mockDb } from '../../../lib/db/mockDb';
import { enhanceTrend, isLLMConfigured } from '../../../lib/llm/contentEnhancer';
import { ITrend } from '../../../models/Trend';
import { withAdminAuth } from '../../../lib/auth/authMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({ message: 'Method not allowed' });
    }

    // Check if LLM is configured
    if (!isLLMConfigured()) {
      return res.status(400).json({ 
        success: false, 
        message: 'LLM is not properly configured. Please set up your API key in the settings.'
      });
    }

    // Get trend ID and enhancement options from request body
    const { trendId, options = {} } = req.body;
    
    if (!trendId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Trend ID is required' 
      });
    }

    // Find trend by looking through all trends and matching the ID
    const allTrends = await mockDb.find().exec();
    const trend = allTrends.find(t => t._id === trendId);
    
    if (!trend) {
      return res.status(404).json({ 
        success: false, 
        message: `Trend with ID ${trendId} not found` 
      });
    }

    // Enhance the trend
    console.log(`Enhancing trend: ${trend.title} with LLM processing...`);
    
    const enhancedTrend = await enhanceTrend(trend, {
      enhanceTitle: options.enhanceTitle !== false,
      enhanceContent: options.enhanceContent !== false,
      keywords: options.keywords || [],
      instructions: options.instructions || 'Make the content more engaging and SEO-friendly'
    });

    // Save the enhanced trend back to the database
    await mockDb.findByIdAndUpdate(trendId, enhancedTrend);

    // Return success response
    return res.status(200).json({ 
      success: true, 
      message: 'Trend enhanced successfully',
      trend: enhancedTrend
    });
  } catch (error) {
    console.error('Error enhancing trend:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error enhancing trend', 
      error: error instanceof Error ? error.message : String(error) 
    });
  }
}

// Export the protected handler with admin authentication
export default withAdminAuth(handler);
