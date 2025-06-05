export interface ITrend {
  _id?: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  imageUrl?: string;
  category: 'Technology' | 'Business' | 'Science' | string;
  tags: string[];
  source: string;
  sourceUrl?: string;
  publishedAt: Date;
  popularity?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const Trend = {
  findOne: async (query: any) => {
    return null; // Will be implemented with mock data
  },
  find: async (query: any) => {
    return []; // Will be implemented with mock data
  }
};

export default Trend;
