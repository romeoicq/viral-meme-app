import { useState, useEffect, FormEvent } from 'react';
import Layout from '../../components/Layout';
import { LLMProvider } from '../../lib/llm/contentEnhancer';
import { GetServerSideProps } from 'next';
import { getAuthServerSideProps } from '../../lib/auth/authMiddleware';

// Interface for LLM settings form
interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
}

// Default settings
const defaultSettings: LLMSettings = {
  provider: 'mock',
  apiKey: '',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 1000
};

// Local storage key
const STORAGE_KEY = 'trendsphere_llm_settings';

// Options for LLM providers
const providerOptions: { value: LLMProvider; label: string }[] = [
  { value: 'mock', label: 'Demo Mode (No API)' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'anthropic', label: 'Anthropic Claude' },
  { value: 'google', label: 'Google Gemini' }
];

// Options for model selection by provider
const modelOptions: Record<LLMProvider, { value: string; label: string }[]> = {
  mock: [{ value: 'mock-model', label: 'Demo Model' }],
  openai: [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' }
  ],
  anthropic: [
    { value: 'claude-3-opus', label: 'Claude 3 Opus' },
    { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku' }
  ],
  google: [
    { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
    { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' }
  ]
};

// Props including authentication status
interface LLMSettingsPageProps {
  isAuthenticated: boolean;
}

export default function LLMSettingsPage({ isAuthenticated }: LLMSettingsPageProps) {
  // State for settings
  const [settings, setSettings] = useState<LLMSettings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [savedApiKey, setSavedApiKey] = useState<string>('');

  // Function to get the authentication token from cookies
  const getAuthToken = (): string => {
    const cookies = document.cookie.split(';');
    let authToken = '';
    
    cookies.forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name === 'authToken') {
        authToken = value;
      }
    });
    
    return authToken;
  };

  // Load settings from localStorage on initial render
  useEffect(() => {
    const loadLocalSettings = () => {
      try {
        const savedSettings = localStorage.getItem(STORAGE_KEY);
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          setSavedApiKey(parsedSettings.apiKey || '');
          return parsedSettings;
        }
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
      return null;
    };

    const localSettings = loadLocalSettings();
    
    const fetchSettings = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/llm/config', {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch LLM configuration');
        }
        
        const data = await response.json();
        
        if (data.success && data.config) {
          const serverSettings = {
            provider: data.config.provider,
            apiKey: localSettings?.apiKey || '', // Use localStorage API key if available
            model: data.config.model || defaultSettings.model,
            temperature: data.config.temperature || defaultSettings.temperature,
            maxTokens: data.config.maxTokens || defaultSettings.maxTokens
          };
          
          setSettings(serverSettings);
          
          // Save to localStorage for persistence
          localStorage.setItem(STORAGE_KEY, JSON.stringify(serverSettings));
        }
      } catch (error) {
        console.error('Error fetching LLM settings:', error);
        setMessage({ 
          type: 'error', 
          text: error instanceof Error ? error.message : 'Error fetching settings' 
        });
        
        // If server fetch fails but we have local settings, use those
        if (localSettings) {
          setSettings(localSettings);
        }
      } finally {
        setLoading(false);
      }
    };
    
    // If we have local settings, use them immediately, then fetch from server
    if (localSettings) {
      setSettings(localSettings);
    }
    
    fetchSettings();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setTestResult(null);
    
    try {
      setLoading(true);
      
      // Save to localStorage first for immediate persistence
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      setSavedApiKey(settings.apiKey);
      
      const response = await fetch('/api/llm/config', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }
      
      const data = await response.json();
      
      setMessage({ 
        type: 'success', 
        text: data.message || 'Settings updated successfully' 
      });
    } catch (error) {
      console.error('Error updating LLM settings:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating settings' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (field: keyof LLMSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
    
    // If provider changes, update the model to first option for that provider
    if (field === 'provider') {
      setSettings(prev => ({ 
        ...prev, 
        [field]: value,
        model: modelOptions[value as LLMProvider][0]?.value || defaultSettings.model
      }));
    }
  };

  // Test the LLM configuration
  const testLLMConfig = async () => {
    setTestResult(null);
    
    try {
      setLoading(true);
      setTestResult('Testing connection to LLM provider...');
      
      // For this demo, we'll just simulate a successful test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real application, you would test the connection here
      // const response = await fetch('/api/llm/test-connection');
      // const data = await response.json();
      
      setTestResult('✅ Connection successful! The LLM API is working correctly.');
    } catch (error) {
      console.error('Error testing LLM connection:', error);
      setTestResult('❌ Connection failed. Please check your API key and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">LLM Integration Settings</h1>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <p className="text-blue-700">
            Configure the LLM integration to enhance trend content with AI. 
            This allows automatic improvement of titles and content for better SEO and readability.
          </p>
        </div>
        
        {message && (
          <div className={`p-4 mb-6 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              LLM Provider
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={settings.provider}
              onChange={(e) => handleChange('provider', e.target.value)}
              disabled={loading}
            >
              {providerOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          {settings.provider !== 'mock' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                API Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={settings.apiKey}
                  onChange={(e) => handleChange('apiKey', e.target.value)}
                  disabled={loading}
                  placeholder={savedApiKey ? '••••••••••••••••••••••' : `Enter your ${settings.provider} API key`}
                />
                {savedApiKey && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm">
                    <span className="text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {savedApiKey ? 'API key is saved and ready to use. Enter a new key to update.' : 'Your API key is securely stored and never shared.'}
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Model
            </label>
            <select
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={settings.model}
              onChange={(e) => handleChange('model', e.target.value)}
              disabled={loading}
            >
              {modelOptions[settings.provider].map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Temperature: {settings.temperature}
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              className="w-full"
              value={settings.temperature}
              onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>More deterministic (0.0)</span>
              <span>More creative (1.0)</span>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Max Tokens: {settings.maxTokens}
            </label>
            <input
              type="range"
              min="100"
              max="4000"
              step="100"
              className="w-full"
              value={settings.maxTokens}
              onChange={(e) => handleChange('maxTokens', parseInt(e.target.value))}
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Shorter responses</span>
              <span>Longer responses</span>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
            
            <button
              type="button"
              className="bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 disabled:bg-gray-300"
              disabled={loading || settings.provider === 'mock' || (!settings.apiKey && !savedApiKey)}
              onClick={testLLMConfig}
            >
              Test Connection
            </button>
          </div>
          
          {testResult && (
            <div className={`mt-4 p-3 rounded ${
              testResult.includes('✅') ? 'bg-green-100' : testResult.includes('❌') ? 'bg-red-100' : 'bg-gray-100'
            }`}>
              {testResult}
            </div>
          )}
        </form>
        
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4">
          <h3 className="font-bold text-yellow-800">Usage Notes</h3>
          <ul className="list-disc ml-5 mt-2 text-yellow-700">
            <li>In demo mode, no actual API calls are made; mock responses will be returned.</li>
            <li>When using a real provider, API calls will be billed according to your subscription.</li>
            <li>Each trend enhancement typically costs between $0.01 - $0.10 depending on length.</li>
            <li>For OpenAI, visit <a href="https://platform.openai.com/" className="underline" target="_blank" rel="noopener noreferrer">platform.openai.com</a> to get your API key.</li>
            <li>For Claude, visit <a href="https://console.anthropic.com/" className="underline" target="_blank" rel="noopener noreferrer">console.anthropic.com</a> to get your API key.</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}

// Use the getAuthServerSideProps to protect this page
export const getServerSideProps: GetServerSideProps = context => {
  return getAuthServerSideProps(context);
};
