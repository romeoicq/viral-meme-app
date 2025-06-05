import { IProblem } from '../../models/Problem';

class ProblemDatabase {
  private problems: IProblem[] = [];
  
  async create(problem: IProblem): Promise<IProblem> {
    const newProblem = {
      ...problem,
      _id: `problem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      discoveredAt: new Date(),
      status: 'new' as const
    };
    this.problems.push(newProblem);
    return newProblem;
  }
  
  async find(query: any = {}): Promise<IProblem[]> {
    return this.problems.filter(problem => {
      if (query.category && problem.category !== query.category) return false;
      if (query.platform && problem.platform !== query.platform) return false;
      if (query.urgencyScore && problem.urgencyScore < query.urgencyScore) return false;
      if (query.opportunityScore && problem.opportunityScore < query.opportunityScore) return false;
      if (query.status && problem.status !== query.status) return false;
      if (query.slug && problem.slug !== query.slug) return false;
      return true;
    });
  }
  
  async findOne(query: any): Promise<IProblem | null> {
    const results = await this.find(query);
    return results.length > 0 ? results[0] : null;
  }
  
  async findHighPriority(): Promise<IProblem[]> {
    return this.problems.filter(p => 
      p.urgencyScore >= 7 && p.opportunityScore >= 7
    ).sort((a, b) => 
      (b.urgencyScore + b.opportunityScore) - (a.urgencyScore + a.opportunityScore)
    );
  }
  
  async findByPlatform(platform: string): Promise<IProblem[]> {
    return this.problems.filter(p => p.platform === platform);
  }
  
  async findByCategory(category: string): Promise<IProblem[]> {
    return this.problems.filter(p => p.category === category);
  }
  
  async update(id: string, updates: Partial<IProblem>): Promise<IProblem | null> {
    const index = this.problems.findIndex(p => p._id === id);
    if (index === -1) return null;
    
    this.problems[index] = { ...this.problems[index], ...updates };
    return this.problems[index];
  }
  
  async delete(id: string): Promise<boolean> {
    const index = this.problems.findIndex(p => p._id === id);
    if (index === -1) return false;
    
    this.problems.splice(index, 1);
    return true;
  }
  
  async count(query: any = {}): Promise<number> {
    const results = await this.find(query);
    return results.length;
  }
  
  async getStats(): Promise<{
    total: number;
    byPlatform: Record<string, number>;
    byCategory: Record<string, number>;
    byStatus: Record<string, number>;
    avgUrgency: number;
    avgOpportunity: number;
  }> {
    const total = this.problems.length;
    const byPlatform: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    
    let totalUrgency = 0;
    let totalOpportunity = 0;
    
    this.problems.forEach(problem => {
      byPlatform[problem.platform] = (byPlatform[problem.platform] || 0) + 1;
      byCategory[problem.category] = (byCategory[problem.category] || 0) + 1;
      byStatus[problem.status] = (byStatus[problem.status] || 0) + 1;
      totalUrgency += problem.urgencyScore;
      totalOpportunity += problem.opportunityScore;
    });
    
    return {
      total,
      byPlatform,
      byCategory,
      byStatus,
      avgUrgency: total > 0 ? totalUrgency / total : 0,
      avgOpportunity: total > 0 ? totalOpportunity / total : 0
    };
  }
  
  // Initialize with some sample data for testing
  async initializeSampleData(): Promise<void> {
    const sampleProblems: IProblem[] = [
      {
        title: "Need help integrating payment API with React app",
        slug: "need-help-integrating-payment-api-react-app",
        description: "I'm struggling to integrate Stripe with my React application. The payments keep failing and I can't figure out why. Need urgent help as client is waiting.",
        platform: 'reddit',
        platformId: 'sample1',
        author: {
          username: 'dev_frustrated',
          profileUrl: 'https://reddit.com/u/dev_frustrated'
        },
        category: 'Technology',
        subcategory: 'Web Development',
        tags: ['React', 'Stripe', 'API', 'Payment', 'Integration'],
        urgencyScore: 8,
        opportunityScore: 9,
        sentimentScore: -0.6,
        engagementMetrics: {
          upvotes: 45,
          comments: 23
        },
        keywordMatches: ['API', 'integration', 'struggling', 'urgent help'],
        businessPotential: {
          marketSize: 'large',
          competitionLevel: 'medium',
          monetizationPotential: 'high'
        },
        sourceUrl: 'https://reddit.com/r/webdev/sample1',
        publishedAt: new Date('2025-05-30T10:00:00Z'),
        discoveredAt: new Date(),
        status: 'new'
      },
      {
        title: "Small business needs inventory management solution",
        slug: "small-business-inventory-management-solution",
        description: "Running a small retail store and current spreadsheet system is becoming unmanageable. Looking for affordable inventory management software that can handle 500+ products.",
        platform: 'reddit',
        platformId: 'sample2',
        author: {
          username: 'smallbiz_owner',
          profileUrl: 'https://reddit.com/u/smallbiz_owner'
        },
        category: 'Business',
        subcategory: 'Operations',
        tags: ['Inventory', 'Small Business', 'Management', 'Software', 'Retail'],
        urgencyScore: 6,
        opportunityScore: 8,
        sentimentScore: -0.3,
        engagementMetrics: {
          upvotes: 32,
          comments: 18
        },
        keywordMatches: ['needs', 'solution', 'unmanageable', 'looking for'],
        businessPotential: {
          marketSize: 'medium',
          competitionLevel: 'medium',
          monetizationPotential: 'high'
        },
        sourceUrl: 'https://reddit.com/r/smallbusiness/sample2',
        publishedAt: new Date('2025-05-30T09:00:00Z'),
        discoveredAt: new Date(),
        status: 'analyzed'
      },
      {
        title: "Database performance issues with large dataset",
        slug: "database-performance-issues-large-dataset",
        description: "PostgreSQL queries are taking forever with 10M+ records. Need optimization help urgently as production site is slowing down.",
        platform: 'stackoverflow',
        platformId: 'sample3',
        author: {
          username: 'backend_dev',
          reputation: 1250,
          profileUrl: 'https://stackoverflow.com/users/123456/backend_dev'
        },
        category: 'Technology',
        subcategory: 'Database',
        tags: ['PostgreSQL', 'Performance', 'Database', 'Optimization', 'Production'],
        urgencyScore: 9,
        opportunityScore: 7,
        sentimentScore: -0.8,
        engagementMetrics: {
          upvotes: 28,
          comments: 12
        },
        keywordMatches: ['issues', 'urgently', 'slowing down', 'need help'],
        businessPotential: {
          marketSize: 'medium',
          competitionLevel: 'high',
          monetizationPotential: 'medium'
        },
        sourceUrl: 'https://stackoverflow.com/questions/sample3',
        publishedAt: new Date('2025-05-30T11:00:00Z'),
        discoveredAt: new Date(),
        status: 'actionable'
      }
    ];
    
    for (const problem of sampleProblems) {
      await this.create(problem);
    }
  }
}

export const problemDb = new ProblemDatabase();
