export interface IProblem {
  _id?: string;
  title: string;
  slug: string;
  description: string;
  platform: 'reddit' | 'stackoverflow' | 'quora' | 'askfm';
  platformId: string;
  author: {
    username: string;
    reputation?: number;
    profileUrl?: string;
  };
  category: 'Technology' | 'Business' | 'Consumer' | 'Personal' | 'Health';
  subcategory?: string;
  tags: string[];
  urgencyScore: number; // 1-10
  opportunityScore: number; // 1-10
  sentimentScore: number; // -1 to 1
  engagementMetrics: {
    upvotes?: number;
    comments?: number;
    views?: number;
    shares?: number;
  };
  keywordMatches: string[];
  businessPotential: {
    marketSize: 'small' | 'medium' | 'large';
    competitionLevel: 'low' | 'medium' | 'high';
    monetizationPotential: 'low' | 'medium' | 'high';
  };
  sourceUrl: string;
  publishedAt: Date;
  discoveredAt: Date;
  lastAnalyzed?: Date;
  status: 'new' | 'analyzed' | 'actionable' | 'archived';
  notes?: string;
}

const Problem = {
  findOne: async (query: any) => {
    return null; // Will be implemented with mock data
  },
  find: async (query: any) => {
    return []; // Will be implemented with mock data
  }
};

export default Problem;
