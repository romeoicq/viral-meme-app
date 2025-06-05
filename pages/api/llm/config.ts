import { NextApiRequest, NextApiResponse } from 'next';
import { setLLMConfig, getLLMConfig, LLMConfig } from '../../../lib/llm/contentEnhancer';
import { withAdminAuth } from '../../../lib/auth/authMiddleware';

// Handler function for LLM configuration
async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Handle GET request to retrieve the current LLM configuration
    if (req.method === 'GET') {
      const config = getLLMConfig();
      
      // Mask the API key for security
      const secureConfig = {
        ...config,
        apiKey: config.apiKey ? '********' : ''
      };
      
      return res.status(200).json({ 
        success: true, 
        config: secureConfig
      });
    }
    
    // Handle POST request to update the LLM configuration
    if (req.method === 'POST') {
      // Get the configuration from the request body
      const { provider, apiKey, model, temperature, maxTokens } = req.body as Partial<LLMConfig>;
      
      // Validate provider
      if (provider && !['openai', 'anthropic', 'google', 'mock'].includes(provider)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid provider. Supported providers are: openai, anthropic, google, mock'
        });
      }
      
      // Validate API key
      if (provider && provider !== 'mock' && !apiKey) {
        return res.status(400).json({ 
          success: false, 
          message: 'API key is required for non-mock providers'
        });
      }
      
      // Update the configuration
      const updatedConfig = setLLMConfig({ 
        provider, 
        apiKey, 
        model, 
        temperature, 
        maxTokens 
      });
      
      // Return the updated configuration with masked API key
      return res.status(200).json({ 
        success: true, 
        message: 'LLM configuration updated successfully',
        config: {
          ...updatedConfig,
          apiKey: updatedConfig.apiKey ? '********' : ''
        }
      });
    }
    
    // Handle unsupported HTTP methods
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in LLM config API:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error updating LLM configuration', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Export the protected handler with admin authentication
export default withAdminAuth(handler);
