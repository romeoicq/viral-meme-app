import axios from 'axios';
import { IProblem } from '../../models/Problem';
import { problemAnalyzer } from '../analysis/problemAnalyzer';

export class RedditCollector {
  private clientId: string;
  private clientSecret: string;
  private userAgent: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || '';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    this.userAgent = 'QAMonitor/1.0';
  }
  
  async getAccessToken(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken || 'mock_token';
    }
    
    // For development, we'll create mock data instead of real API calls
    if (!this.clientId || !this.clientSecret) {
      console.log('Reddit API credentials not found, using mock data');
      return 'mock_token';
    }
    
    try {
      const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
      
      const response = await axios.post(
        'https://www.reddit.com/api/v1/access_token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'User-Agent': this.userAgent,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 10000
        }
      );
      
      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      
      return this.accessToken || 'mock_token';
    } catch (error) {
      console.error('Error getting Reddit access token:', error);
      return 'mock_token'; // Fallback to mock data
    }
  }
  
  async collectProblems(subreddits: string[], keywords: string[]): Promise<IProblem[]> {
    const token = await this.getAccessToken();
    const problems: IProblem[] = [];
    
    // If using mock token, return mock data
    if (token === 'mock_token') {
      return this.getMockRedditProblems();
    }
    
    for (const subreddit of subreddits) {
      try {
        const response = await axios.get(
          `https://oauth.reddit.com/r/${subreddit}/new`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'User-Agent': this.userAgent
            },
            params: {
              limit: 100
            },
            timeout: 10000
          }
        );
        
        const posts = response.data.data.children;
        
        for (const post of posts) {
          const data = post.data;
          
          // Check if post contains problem indicators
          if (this.isProblemPost(data.title, data.selftext, keywords)) {
            const problem = await this.convertToProblem(data, subreddit);
            problems.push(problem);
          }
        }
      } catch (error) {
        console.error(`Error collecting from r/${subreddit}:`, error);
        // Add some mock data for this subreddit on error
        const mockProblems = this.getMockRedditProblems().filter(p => 
          p.tags.includes(subreddit)
        );
        problems.push(...mockProblems);
      }
    }
    
    return problems;
  }
  
  private isProblemPost(title: string, content: string, keywords: string[]): boolean {
    const text = `${title} ${content}`.toLowerCase();
    
    // Problem indicator patterns
    const problemPatterns = [
      /how do i fix/i,
      /can't figure out/i,
      /struggling with/i,
      /need help with/i,
      /anyone know how to/i,
      /this isn't working/i,
      /having trouble/i,
      /problem with/i,
      /issue with/i,
      /error/i,
      /not working/i,
      /broken/i,
      /failing/i,
      /stuck/i,
      /help me/i,
      /how to solve/i
    ];
    
    // Check for problem patterns
    const hasProblems = problemPatterns.some(pattern => pattern.test(text));
    
    // Check for keywords
    const hasKeywords = keywords.some(keyword => 
      text.includes(keyword.toLowerCase())
    );
    
    return hasProblems || hasKeywords;
  }
  
  private async convertToProblem(redditPost: any, subreddit: string): Promise<IProblem> {
    const analysis = await problemAnalyzer.analyzeProblem(
      redditPost.title,
      redditPost.selftext || redditPost.title,
      'reddit',
      {
        upvotes: redditPost.ups,
        comments: redditPost.num_comments
      },
      { tags: [subreddit] }
    );
    
    const problem: IProblem = {
      title: redditPost.title,
      slug: analysis.slug || problemAnalyzer.generateSlug(redditPost.title),
      description: redditPost.selftext || redditPost.title,
      platform: 'reddit',
      platformId: redditPost.id,
      author: {
        username: redditPost.author,
        profileUrl: `https://reddit.com/u/${redditPost.author}`
      },
      category: analysis.category || problemAnalyzer.categorizeFromSubreddit(subreddit),
      tags: [subreddit, ...(analysis.tags || [])],
      urgencyScore: analysis.urgencyScore || 5,
      opportunityScore: analysis.opportunityScore || 5,
      sentimentScore: analysis.sentimentScore || 0,
      engagementMetrics: {
        upvotes: redditPost.ups,
        comments: redditPost.num_comments
      },
      keywordMatches: analysis.keywordMatches || [],
      businessPotential: analysis.businessPotential || {
        marketSize: 'medium',
        competitionLevel: 'medium',
        monetizationPotential: 'medium'
      },
      sourceUrl: `https://reddit.com${redditPost.permalink}`,
      publishedAt: new Date(redditPost.created_utc * 1000),
      discoveredAt: new Date(),
      status: 'new'
    };
    
    return problem;
  }
  
  private getMockRedditProblems(): IProblem[] {
    return [
      {
        _id: 'reddit-mock-1',
        title: 'API integration keeps failing - need urgent help',
        slug: 'api-integration-keeps-failing-need-urgent-help',
        description: 'I\'ve been trying to integrate a third-party API into my React app for 3 days now. The requests keep timing out and I can\'t figure out why. My client launch is next week and I\'m stuck. Has anyone dealt with similar timeout issues?',
        platform: 'reddit',
        platformId: 'mock1',
        author: {
          username: 'frustrated_dev_123',
          profileUrl: 'https://reddit.com/u/frustrated_dev_123'
        },
        category: 'Technology',
        subcategory: 'Web Development',
        tags: ['webdev', 'API', 'React', 'integration', 'timeout'],
        urgencyScore: 9,
        opportunityScore: 8,
        sentimentScore: -0.7,
        engagementMetrics: {
          upvotes: 67,
          comments: 34
        },
        keywordMatches: ['need help', 'stuck', 'failing'],
        businessPotential: {
          marketSize: 'large',
          competitionLevel: 'medium',
          monetizationPotential: 'high'
        },
        sourceUrl: 'https://reddit.com/r/webdev/mock1',
        publishedAt: new Date('2025-05-30T08:30:00Z'),
        discoveredAt: new Date(),
        status: 'new'
      },
      {
        _id: 'reddit-mock-2',
        title: 'Small business automation - spreadsheets are killing us',
        slug: 'small-business-automation-spreadsheets-killing-us',
        description: 'We\'re a 15-person company still using Excel for everything - inventory, customer tracking, invoicing. It\'s becoming a nightmare to maintain and we make errors daily. Looking for affordable business automation solutions that won\'t break the bank. What has worked for other small businesses?',
        platform: 'reddit',
        platformId: 'mock2',
        author: {
          username: 'small_biz_owner',
          profileUrl: 'https://reddit.com/u/small_biz_owner'
        },
        category: 'Business',
        subcategory: 'Operations',
        tags: ['smallbusiness', 'automation', 'Excel', 'inventory', 'CRM'],
        urgencyScore: 7,
        opportunityScore: 9,
        sentimentScore: -0.4,
        engagementMetrics: {
          upvotes: 89,
          comments: 56
        },
        keywordMatches: ['looking for', 'nightmare', 'solutions'],
        businessPotential: {
          marketSize: 'large',
          competitionLevel: 'medium',
          monetizationPotential: 'high'
        },
        sourceUrl: 'https://reddit.com/r/smallbusiness/mock2',
        publishedAt: new Date('2025-05-30T07:15:00Z'),
        discoveredAt: new Date(),
        status: 'new'
      },
      {
        _id: 'reddit-mock-3',
        title: 'Customer support ticket system recommendations?',
        slug: 'customer-support-ticket-system-recommendations',
        description: 'Our startup is growing fast and email support is becoming unmanageable. We need a proper ticket system but most solutions are either too expensive or too complex for our 5-person team. What are you using for customer support that doesn\'t cost a fortune?',
        platform: 'reddit',
        platformId: 'mock3',
        author: {
          username: 'startup_founder',
          profileUrl: 'https://reddit.com/u/startup_founder'
        },
        category: 'Business',
        subcategory: 'Customer Support',
        tags: ['entrepreneur', 'customer support', 'startup', 'tickets', 'software'],
        urgencyScore: 6,
        opportunityScore: 8,
        sentimentScore: -0.2,
        engagementMetrics: {
          upvotes: 43,
          comments: 28
        },
        keywordMatches: ['need', 'unmanageable', 'recommendations'],
        businessPotential: {
          marketSize: 'medium',
          competitionLevel: 'high',
          monetizationPotential: 'medium'
        },
        sourceUrl: 'https://reddit.com/r/entrepreneur/mock3',
        publishedAt: new Date('2025-05-30T06:45:00Z'),
        discoveredAt: new Date(),
        status: 'new'
      },
      {
        _id: 'reddit-mock-4',
        title: 'Database queries taking forever - production site slow',
        slug: 'database-queries-taking-forever-production-site-slow',
        description: 'Our PostgreSQL database has grown to 5M+ records and now simple queries are taking 30+ seconds. Users are complaining about slow page loads. I\'ve tried basic indexing but nothing seems to help. Need database optimization expertise ASAP before we lose customers.',
        platform: 'reddit',
        platformId: 'mock4',
        author: {
          username: 'backend_engineer',
          profileUrl: 'https://reddit.com/u/backend_engineer'
        },
        category: 'Technology',
        subcategory: 'Database',
        tags: ['programming', 'PostgreSQL', 'performance', 'optimization', 'production'],
        urgencyScore: 9,
        opportunityScore: 7,
        sentimentScore: -0.8,
        engagementMetrics: {
          upvotes: 92,
          comments: 47
        },
        keywordMatches: ['taking forever', 'need', 'ASAP'],
        businessPotential: {
          marketSize: 'medium',
          competitionLevel: 'high',
          monetizationPotential: 'medium'
        },
        sourceUrl: 'https://reddit.com/r/programming/mock4',
        publishedAt: new Date('2025-05-30T09:20:00Z'),
        discoveredAt: new Date(),
        status: 'new'
      }
    ];
  }
}

export const redditCollector = new RedditCollector();
