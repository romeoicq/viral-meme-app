import { ITrend } from '../../models/Trend';

// In-memory storage for trends
const trendsStore: Record<string, ITrend> = {};

// Mock trends for initial display
const mockTrends: Partial<ITrend>[] = [
  {
    title: 'The Rise of AI in Healthcare',
    slug: 'rise-of-ai-in-healthcare',
    summary: 'How artificial intelligence is revolutionizing healthcare delivery and improving patient outcomes.',
    content: '<h2>AI is Transforming Healthcare</h2><p>Artificial intelligence is making significant strides in the healthcare industry, from diagnosis to treatment planning.</p><p>Recent developments have shown how machine learning algorithms can detect patterns in medical images with accuracy that rivals human experts.</p>',
    source: 'TechHealth',
    sourceUrl: 'https://techhealth.com/ai-healthcare',
    category: 'Technology',
    tags: ['AI', 'Healthcare', 'Innovation'],
    imageUrl: 'https://images.unsplash.com/photo-1576671081837-49000212a370?q=80&w=800',
    publishedAt: new Date('2025-05-01'),
    popularity: 95
  },
  {
    title: 'Sustainable Fashion: The Eco-Friendly Revolution',
    slug: 'sustainable-fashion-eco-friendly-revolution',
    summary: 'How sustainable materials and ethical manufacturing are reshaping the fashion industry for a greener future.',
    content: '<h2>The Rise of Eco-Conscious Fashion</h2><p>Fashion brands around the world are embracing sustainable practices, from using recycled materials to implementing zero-waste manufacturing processes.</p><p>Consumers are increasingly prioritizing ethical and environmentally friendly clothing options, driving major changes across the industry.</p>',
    source: 'FashionForward',
    sourceUrl: 'https://fashionforward.com/sustainable-fashion',
    category: 'Fashion',
    tags: ['Fashion', 'Sustainability', 'Ethical Manufacturing'],
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=800',
    publishedAt: new Date('2025-05-03'),
    popularity: 88
  },
  {
    title: 'Sustainable Finance: Investing in the Future',
    slug: 'sustainable-finance-investing-future',
    summary: 'How sustainable investing is reshaping the financial landscape and driving positive environmental impact.',
    content: '<h2>The Growth of ESG Investing</h2><p>Environmental, Social, and Governance (ESG) investing continues to gain momentum as investors seek both financial returns and positive impact.</p><p>Major financial institutions are now integrating sustainability metrics into their investment decisions.</p>',
    source: 'EcoFinance',
    sourceUrl: 'https://ecofinance.org/sustainable-investing',
    category: 'Business',
    tags: ['Finance', 'Sustainability', 'ESG'],
    imageUrl: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800',
    publishedAt: new Date('2025-04-28'),
    popularity: 87
  },
  {
    title: 'A-List Power Couple Announces Joint Film Project',
    slug: 'a-list-power-couple-joint-film-project',
    summary: "Hollywood's favorite power couple reveals plans for their first joint production venture, set to challenge industry norms.",
    content: "<h2>New Era of Celebrity Collaborations</h2><p>The announcement has sent waves through Hollywood as the A-list couple plans to not only star in but also produce and partially direct the upcoming feature.</p><p>Industry insiders suggest this collaboration could represent a new model for creative control in an industry traditionally dominated by major studios.</p>",
    source: 'Entertainment Today',
    sourceUrl: 'https://entertainment-today.com/power-couple-announcement',
    category: 'Celebrity News',
    tags: ['Entertainment', 'Hollywood', 'Film Production'],
    imageUrl: 'https://images.unsplash.com/photo-1512149673953-1e251807ec7c?q=80&w=800',
    publishedAt: new Date('2025-05-06'),
    popularity: 94
  },
  {
    title: 'Quantum Computing Breakthrough',
    slug: 'quantum-computing-breakthrough',
    summary: 'Researchers achieve major advancement in quantum computing technology that could accelerate practical applications.',
    content: '<h2>New Milestone in Quantum Processing</h2><p>Scientists have achieved a significant breakthrough in quantum computing stability, maintaining qubit coherence for record durations.</p><p>This development brings practical quantum computing applications closer to reality.</p>',
    source: 'QuantumWorld',
    sourceUrl: 'https://quantumworld.tech/breakthrough',
    category: 'Science',
    tags: ['Quantum Computing', 'Technology', 'Research'],
    imageUrl: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?q=80&w=800',
    publishedAt: new Date('2025-05-05'),
    popularity: 92
  },
  {
    title: 'Personalized Nutrition Services',
    slug: 'personalized-nutrition-services',
    summary: 'The emergence of AI-powered nutrition platforms offering custom dietary recommendations based on individual biochemistry.',
    content: '<h2>Nutrition Tailored to Your DNA</h2><p>Companies are leveraging genetic testing and AI to create highly personalized nutrition recommendations. These services analyze individual metabolic responses to different foods and provide tailored dietary plans for optimal health outcomes.</p><p>Studies show that personalized nutrition can significantly improve health markers compared to generic dietary guidelines.</p>',
    source: 'TrendHunter',
    sourceUrl: 'https://trendhunter.com/nutrition-tech',
    category: 'Food & Beverage',
    tags: ['Food & Beverage', 'Health', 'Technology'],
    imageUrl: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?q=80&w=800',
    publishedAt: new Date('2025-05-07'),
    popularity: 89
  }
];

// Initialize store with mock data
mockTrends.forEach(trend => {
  const id = Math.random().toString(36).substring(2, 15);
  trendsStore[trend.slug as string] = {
    _id: id,
    ...trend as any,
    createdAt: new Date(),
    updatedAt: new Date()
  } as ITrend;
});

export const mockDb = {
  // Find trends with filtering and pagination - supports chaining
  find: (query: any = {}) => {
    console.log('Loading trends from JSON file...');
    let results = Object.values(trendsStore);
    console.log(`Loaded ${results.length} trends from JSON file`);
    console.log('Using mock database');
    
    // Apply filtering
    if (query.category) {
      results = results.filter(trend => trend.category === query.category);
    }
    
    if (query.tags && query.$in) {
      results = results.filter(trend => 
        trend.tags.some(tag => query.tags.$in.includes(tag))
      );
    }
    
    if (query.$or) {
      results = results.filter(trend => {
        return query.$or.some((condition: any) => {
          if (condition.title && condition.title.$regex) {
            return trend.title.toLowerCase().includes(condition.title.$regex.toLowerCase());
          }
          if (condition.content && condition.content.$regex) {
            return trend.content.toLowerCase().includes(condition.content.$regex.toLowerCase());
          }
          if (condition.summary && condition.summary.$regex) {
            return trend.summary.toLowerCase().includes(condition.summary.$regex.toLowerCase());
          }
          return false;
        });
      });
    }
    
    if (query.slug) {
      results = results.filter(trend => trend.slug === query.slug);
    }
    
    if (query._id && query._id.$ne) {
      results = results.filter(trend => trend._id !== query._id.$ne);
    }
    
    // Return a chainable object
    return {
      sort: (sortOptions: any) => {
        const [field, order] = Object.entries(sortOptions)[0];
        results.sort((a: any, b: any) => {
          if (a[field] < b[field]) return order === 1 ? -1 : 1;
          if (a[field] > b[field]) return order === 1 ? 1 : -1;
          return 0;
        });
        return {
          skip: (skipNum: number) => {
            results = results.slice(skipNum);
            return {
              limit: (limitNum: number) => {
                const limitedResults = results.slice(0, limitNum);
                return {
                  exec: async () => limitedResults
                };
              },
              exec: async () => results
            };
          },
          limit: (limitNum: number) => {
            results = results.slice(0, limitNum);
            return {
              exec: async () => results
            };
          },
          exec: async () => results
        };
      },
      skip: (skipNum: number) => {
        results = results.slice(skipNum);
        return {
          limit: (limitNum: number) => {
            return results.slice(0, limitNum);
          },
          exec: async () => results
        };
      },
      limit: (limitNum: number) => {
        results = results.slice(0, limitNum);
        return {
          exec: async () => results
        };
      },
      exec: async () => results
    };
  },
  
  // Find one trend by criteria
  findOne: async (query: any = {}) => {
    const results = Object.values(trendsStore);
    
    if (query.slug) {
      return results.find(trend => trend.slug === query.slug) || null;
    }
    
    return results[0] || null;
  },
  
  // Count documents matching criteria
  countDocuments: async (query: any = {}) => {
    let count = Object.values(trendsStore).length;
    
    if (query.category) {
      count = Object.values(trendsStore).filter(trend => 
        trend.category === query.category
      ).length;
    }
    
    return count;
  },
  
  // Get distinct values for a field
  distinct: async (field: string) => {
    const values = new Set<string>();
    Object.values(trendsStore).forEach(trend => {
      if (field === 'category' && trend.category) {
        values.add(trend.category);
      }
    });
    return Array.from(values);
  },
  
  // Create a new trend
  create: async (data: Partial<ITrend>) => {
    const id = Math.random().toString(36).substring(2, 15);
    const now = new Date();
    
    const newTrend = {
      _id: id,
      ...data,
      createdAt: now,
      updatedAt: now
    } as ITrend;
    
    trendsStore[data.slug as string] = newTrend;
    return newTrend;
  },
  
  // Update a trend by ID
  findByIdAndUpdate: async (id: string, data: Partial<ITrend>) => {
    const trend = Object.values(trendsStore).find(t => t._id === id);
    if (trend) {
      trendsStore[trend.slug] = {
        ...trend,
        ...data,
        updatedAt: new Date()
      };
      return trendsStore[trend.slug];
    }
    return null;
  }
};
