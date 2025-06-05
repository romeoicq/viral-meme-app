import { IProblem } from '../../models/Problem';
import { problemAnalyzer } from '../analysis/problemAnalyzer';

export class ExpandedQACollector {
  
  // Collect from expanded list of Q&A platforms
  async collectFromAllQAPlatforms(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    
    try {
      // Stack Exchange Network (Ask Ubuntu, Superuser, etc.)
      const stackExchangeProblems = await this.collectFromStackExchangeNetwork();
      problems.push(...stackExchangeProblems);
      
      // ASKfm public posts
      const askfmProblems = await this.collectFromASKfm();
      problems.push(...askfmProblems);
      
      // More platforms can be added here as needed
      
    } catch (error) {
      console.error('Error collecting from expanded Q&A sources:', error);
    }
    
    return problems;
  }
  
  // Stack Exchange Network - Ask Ubuntu, Superuser, Server Fault, etc.
  private async collectFromStackExchangeNetwork(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    const sites = [
      { site: 'askubuntu', name: 'Ask Ubuntu', category: 'Technology' },
      { site: 'superuser', name: 'Super User', category: 'Technology' },
      { site: 'serverfault', name: 'Server Fault', category: 'Technology' },
      { site: 'unix', name: 'Unix & Linux', category: 'Technology' },
      { site: 'apple', name: 'Ask Different', category: 'Technology' }
    ];
    
    for (const siteInfo of sites) {
      try {
        // Stack Exchange API v2.3 - free with rate limits
        const response = await fetch(
          `https://api.stackexchange.com/2.3/questions?order=desc&sort=creation&site=${siteInfo.site}&pagesize=5&filter=withbody`
        );
        const data = await response.json();
        
        if (data.items && Array.isArray(data.items)) {
          for (const item of data.items) {
            const problem = await this.convertStackExchangeToProblem(item, siteInfo);
            problems.push(problem);
          }
        }
      } catch (error) {
        console.error(`Error fetching from ${siteInfo.name}:`, error);
      }
    }
    
    return problems;
  }
  
  // ASKfm public posts (simulated - real implementation would need web scraping)
  private async collectFromASKfm(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    
    // Mock ASKfm problems since real scraping would be more complex
    const mockAskfmProblems = [
      {
        title: "How to deal with anxiety in social situations?",
        body: "I always feel nervous when meeting new people and it's affecting my career. Any advice?",
        author: "anxious_student",
        tags: ["anxiety", "social", "career", "help"]
      },
      {
        title: "Best way to learn programming from scratch?",
        body: "I'm 25 and want to change careers to tech. Where should I start?",
        author: "career_changer",
        tags: ["programming", "career", "education", "beginner"]
      },
      {
        title: "How to start a small business with limited budget?",
        body: "I have an idea but only $1000 to start. Is it possible?",
        author: "entrepreneur_wannabe",
        tags: ["business", "startup", "budget", "advice"]
      }
    ];
    
    for (const mockProblem of mockAskfmProblems) {
      try {
        const analysis = await problemAnalyzer.analyzeProblem(mockProblem.title, mockProblem.body, 'askfm');
        
        const problem: IProblem = {
          title: mockProblem.title,
          slug: problemAnalyzer.generateSlug(mockProblem.title),
          description: mockProblem.body,
          platform: 'askfm' as any,
          platformId: `askfm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          author: {
            username: mockProblem.author,
            profileUrl: `https://ask.fm/${mockProblem.author}`
          },
          category: this.categorizeProblem(mockProblem.tags),
          tags: mockProblem.tags,
          urgencyScore: analysis.urgencyScore || 6,
          opportunityScore: analysis.opportunityScore || 7,
          sentimentScore: analysis.sentimentScore || -0.2,
          engagementMetrics: {
            upvotes: Math.floor(Math.random() * 50) + 10,
            comments: Math.floor(Math.random() * 20) + 5
          },
          keywordMatches: analysis.keywordMatches || [],
          businessPotential: analysis.businessPotential || {
            marketSize: 'medium',
            competitionLevel: 'medium',
            monetizationPotential: 'high'
          },
          sourceUrl: `https://ask.fm/${mockProblem.author}`,
          publishedAt: new Date(),
          discoveredAt: new Date(),
          status: 'new'
        };
        
        problems.push(problem);
      } catch (error) {
        console.error('Error processing ASKfm problem:', error);
      }
    }
    
    return problems;
  }
  
  private async convertStackExchangeToProblem(item: any, siteInfo: any): Promise<IProblem> {
    const analysis = await problemAnalyzer.analyzeProblem(item.title, item.body || '', 'stackexchange');
    
    return {
      title: item.title,
      slug: problemAnalyzer.generateSlug(item.title),
      description: this.stripHtml(item.body || '').substring(0, 300),
      platform: 'stackoverflow', // Use stackoverflow as the closest match
      platformId: `se-${siteInfo.site}-${item.question_id}`,
      author: {
        username: item.owner?.display_name || 'Stack Exchange User',
        profileUrl: item.owner?.link || `https://${siteInfo.site}.stackexchange.com`
      },
      category: siteInfo.category,
      tags: [...item.tags.slice(0, 3), siteInfo.site],
      urgencyScore: analysis.urgencyScore || this.calculateUrgencyFromScore(item.score),
      opportunityScore: analysis.opportunityScore || this.calculateOpportunityFromAnswers(item.answer_count),
      sentimentScore: analysis.sentimentScore || -0.3,
      engagementMetrics: {
        upvotes: item.score || 0,
        comments: item.answer_count || 0
      },
      keywordMatches: analysis.keywordMatches || [],
      businessPotential: analysis.businessPotential || {
        marketSize: 'medium',
        competitionLevel: 'high',
        monetizationPotential: 'medium'
      },
      sourceUrl: item.link,
      publishedAt: new Date(item.creation_date * 1000),
      discoveredAt: new Date(),
      status: 'new'
    };
  }
  
  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
  }
  
  private calculateUrgencyFromScore(score: number): number {
    // Higher scores indicate more urgent/important problems
    return Math.min(10, Math.max(1, score + 5));
  }
  
  private calculateOpportunityFromAnswers(answerCount: number): number {
    // More answers might indicate higher opportunity (more people interested)
    if (answerCount === 0) return 8; // Unanswered = high opportunity
    if (answerCount <= 2) return 6;
    return 4; // Well-answered = lower opportunity
  }
  
  private categorizeProblem(tags: string[]): string {
    const techTags = ['programming', 'code', 'software', 'tech', 'computer'];
    const businessTags = ['business', 'startup', 'career', 'money', 'marketing'];
    const personalTags = ['anxiety', 'social', 'health', 'relationship', 'education'];
    
    if (tags.some(tag => techTags.includes(tag.toLowerCase()))) return 'Technology';
    if (tags.some(tag => businessTags.includes(tag.toLowerCase()))) return 'Business';
    if (tags.some(tag => personalTags.includes(tag.toLowerCase()))) return 'Personal';
    
    return 'General';
  }
}

export const expandedQACollector = new ExpandedQACollector();
