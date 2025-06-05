import { IProblem } from '../../models/Problem';

export class ProblemAnalyzer {
  
  analyzeUrgency(title: string, content: string): number {
    let score = 5; // Base score
    
    // Time-sensitive indicators
    const urgentPatterns = [
      /urgent/i, /asap/i, /immediately/i, /deadline/i,
      /breaking/i, /critical/i, /emergency/i, /quickly/i,
      /soon as possible/i, /time sensitive/i, /rush/i
    ];
    
    // Emotional intensity indicators
    const emotionalPatterns = [
      /desperate/i, /frustrated/i, /stuck/i, /blocked/i,
      /can't work/i, /losing money/i, /clients waiting/i,
      /production down/i, /site is down/i, /not working/i,
      /broken/i, /failing/i, /crashing/i
    ];
    
    // Business impact indicators
    const businessImpactPatterns = [
      /revenue/i, /customers/i, /business/i, /sales/i,
      /launch/i, /live/i, /production/i, /deadline/i
    ];
    
    const text = `${title} ${content}`.toLowerCase();
    
    // Check urgent patterns (high weight)
    urgentPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 2;
    });
    
    // Check emotional patterns (medium weight)
    emotionalPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1.5;
    });
    
    // Check business impact patterns (medium weight)
    businessImpactPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1;
    });
    
    // Question marks often indicate uncertainty/need for help
    const questionMarks = (text.match(/\?/g) || []).length;
    if (questionMarks > 2) score += 0.5;
    
    // Exclamation marks indicate urgency
    const exclamationMarks = (text.match(/!/g) || []).length;
    if (exclamationMarks > 1) score += 1;
    
    return Math.min(Math.max(score, 1), 10);
  }
  
  analyzeOpportunity(problem: IProblem, title?: string, content?: string): number {
    let score = 5; // Base score
    
    const text = `${title || problem.title} ${content || problem.description}`.toLowerCase();
    
    // Market size indicators
    if (problem.engagementMetrics.upvotes && problem.engagementMetrics.upvotes > 50) score += 1;
    if (problem.engagementMetrics.upvotes && problem.engagementMetrics.upvotes > 100) score += 1;
    if (problem.engagementMetrics.comments && problem.engagementMetrics.comments > 20) score += 1;
    if (problem.engagementMetrics.comments && problem.engagementMetrics.comments > 50) score += 1;
    
    // Willingness to pay indicators
    const paymentPatterns = [
      /would pay/i, /willing to pay/i, /looking for paid/i,
      /budget for/i, /hire someone/i, /freelancer/i,
      /consultant/i, /service/i, /solution/i, /tool/i,
      /software/i, /platform/i, /app/i
    ];
    
    paymentPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1.5;
    });
    
    // Competition gap indicators
    const gapPatterns = [
      /no solution/i, /doesn't exist/i, /can't find/i,
      /no tools for/i, /nothing works/i, /no good/i,
      /wish there was/i, /if only/i, /someone should make/i,
      /why isn't there/i, /need something/i
    ];
    
    gapPatterns.forEach(pattern => {
      if (pattern.test(text)) score += 2;
    });
    
    // Scale indicators
    const scalePatterns = [
      /everyone/i, /all of us/i, /team/i, /company/i,
      /multiple/i, /many/i, /enterprise/i, /organization/i
    ];
    
    scalePatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1;
    });
    
    // Technology/business value indicators
    const valuePatterns = [
      /automation/i, /efficiency/i, /productivity/i,
      /save time/i, /streamline/i, /optimize/i,
      /integrate/i, /api/i, /workflow/i
    ];
    
    valuePatterns.forEach(pattern => {
      if (pattern.test(text)) score += 1;
    });
    
    return Math.min(Math.max(score, 1), 10);
  }
  
  analyzeSentiment(title: string, content: string): number {
    const text = `${title} ${content}`.toLowerCase();
    
    // Positive sentiment words
    const positiveWords = [
      'great', 'awesome', 'love', 'perfect', 'excellent',
      'amazing', 'fantastic', 'wonderful', 'good', 'nice',
      'helpful', 'useful', 'easy', 'simple', 'works'
    ];
    
    // Negative sentiment words
    const negativeWords = [
      'hate', 'terrible', 'awful', 'broken', 'useless',
      'frustrated', 'annoying', 'difficult', 'hard', 'impossible',
      'failing', 'error', 'bug', 'issue', 'problem', 'struggle',
      'can\'t', 'won\'t', 'doesn\'t work', 'not working'
    ];
    
    let sentiment = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      sentiment += matches.length * 0.1;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = text.match(regex) || [];
      sentiment -= matches.length * 0.1;
    });
    
    // Normalize to -1 to 1 range
    return Math.max(-1, Math.min(1, sentiment));
  }
  
  categorizeFromSubreddit(subreddit: string): 'Technology' | 'Business' | 'Consumer' | 'Personal' | 'Health' {
    const techSubreddits = ['webdev', 'programming', 'javascript', 'react', 'nodejs', 'python', 'devops', 'sysadmin'];
    const businessSubreddits = ['entrepreneur', 'smallbusiness', 'business', 'marketing', 'sales'];
    const consumerSubreddits = ['buyitforlife', 'frugal', 'deals', 'shopping'];
    const personalSubreddits = ['personalfinance', 'productivity', 'getmotivated', 'selfimprovement'];
    const healthSubreddits = ['fitness', 'health', 'nutrition', 'mentalhealth'];
    
    if (techSubreddits.includes(subreddit.toLowerCase())) return 'Technology';
    if (businessSubreddits.includes(subreddit.toLowerCase())) return 'Business';
    if (consumerSubreddits.includes(subreddit.toLowerCase())) return 'Consumer';
    if (personalSubreddits.includes(subreddit.toLowerCase())) return 'Personal';
    if (healthSubreddits.includes(subreddit.toLowerCase())) return 'Health';
    
    return 'Technology'; // Default
  }
  
  extractTags(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const tags: string[] = [];
    
    // Technology tags
    const techKeywords = [
      'react', 'vue', 'angular', 'javascript', 'python', 'java', 'php',
      'nodejs', 'api', 'database', 'sql', 'mongodb', 'postgresql',
      'aws', 'docker', 'kubernetes', 'stripe', 'payment', 'authentication'
    ];
    
    // Business tags
    const businessKeywords = [
      'inventory', 'crm', 'sales', 'marketing', 'analytics', 'reporting',
      'workflow', 'automation', 'integration', 'saas', 'subscription'
    ];
    
    // Problem types
    const problemKeywords = [
      'performance', 'security', 'optimization', 'integration', 'migration',
      'scaling', 'monitoring', 'testing', 'deployment'
    ];
    
    [...techKeywords, ...businessKeywords, ...problemKeywords].forEach(keyword => {
      if (text.includes(keyword) && !tags.includes(keyword)) {
        tags.push(keyword);
      }
    });
    
    return tags.slice(0, 5); // Limit to 5 tags
  }
  
  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  findKeywordMatches(title: string, content: string): string[] {
    const text = `${title} ${content}`.toLowerCase();
    const matches: string[] = [];
    
    const problemIndicators = [
      'how do i', 'can\'t figure out', 'struggling with', 'need help',
      'anyone know', 'not working', 'having trouble', 'problem with',
      'issue with', 'error', 'bug', 'failing', 'broken'
    ];
    
    problemIndicators.forEach(indicator => {
      if (text.includes(indicator)) {
        matches.push(indicator);
      }
    });
    
    return matches;
  }
  
  assessBusinessPotential(engagementMetrics: any, title: string, content: string): {
    marketSize: 'small' | 'medium' | 'large';
    competitionLevel: 'low' | 'medium' | 'high';
    monetizationPotential: 'low' | 'medium' | 'high';
  } {
    const text = `${title} ${content}`.toLowerCase();
    
    // Assess market size based on engagement and problem scope
    let marketSize: 'small' | 'medium' | 'large' = 'small';
    if (engagementMetrics.upvotes > 50 || engagementMetrics.comments > 20) marketSize = 'medium';
    if (engagementMetrics.upvotes > 100 || engagementMetrics.comments > 50) marketSize = 'large';
    
    // Enterprise/business indicators suggest larger market
    if (text.includes('enterprise') || text.includes('business') || text.includes('company')) {
      marketSize = marketSize === 'small' ? 'medium' : 'large';
    }
    
    // Assess competition level
    let competitionLevel: 'low' | 'medium' | 'high' = 'medium';
    if (text.includes('no solution') || text.includes('doesn\'t exist')) competitionLevel = 'low';
    if (text.includes('many options') || text.includes('saturated')) competitionLevel = 'high';
    
    // Assess monetization potential
    let monetizationPotential: 'low' | 'medium' | 'high' = 'medium';
    if (text.includes('would pay') || text.includes('budget') || text.includes('hire')) {
      monetizationPotential = 'high';
    }
    if (text.includes('free') || text.includes('open source')) {
      monetizationPotential = 'low';
    }
    
    return { marketSize, competitionLevel, monetizationPotential };
  }
  
  async analyzeProblem(
    title: string,
    content: string,
    platform: string,
    engagementMetrics: any = {},
    existingProblem?: Partial<IProblem>
  ): Promise<Partial<IProblem>> {
    const urgencyScore = this.analyzeUrgency(title, content);
    const opportunityScore = this.analyzeOpportunity(
      existingProblem as IProblem || { engagementMetrics } as IProblem,
      title,
      content
    );
    const sentimentScore = this.analyzeSentiment(title, content);
    const tags = this.extractTags(title, content);
    const keywordMatches = this.findKeywordMatches(title, content);
    const businessPotential = this.assessBusinessPotential(engagementMetrics, title, content);
    
    // Determine category based on content
    let category: 'Technology' | 'Business' | 'Consumer' | 'Personal' | 'Health' = 'Technology';
    if (platform === 'reddit' && existingProblem?.tags) {
      const firstTag = existingProblem.tags[0];
      category = this.categorizeFromSubreddit(firstTag);
    }
    
    return {
      urgencyScore,
      opportunityScore,
      sentimentScore,
      category,
      tags,
      keywordMatches,
      businessPotential,
      slug: this.generateSlug(title)
    };
  }
}

export const problemAnalyzer = new ProblemAnalyzer();
