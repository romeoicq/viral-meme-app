import axios from 'axios';
import * as xml2js from 'xml2js';
import { ITrend } from '../../models/Trend';

// Function to generate a slug from a title
const generateSlug = (title: string): string => {
  // Clean up the title from CDATA and TrendHunter.com suffix
  let cleanTitle = title.replace(/\<\!\[CDATA\[ |\(TrendHunter\.com\)|\]\]\>/g, '').trim();
  return cleanTitle
    .toLowerCase()
    .replace(/[^\w\s]/gi, '')
    .replace(/\s+/g, '-');
};

// Function to extract an image URL from HTML content or enclosure
const extractImageUrl = (item: any): string => {
  // First try to get the image from enclosure
  if (item.enclosure && item.enclosure.$.url) {
    return item.enclosure.$.url;
  }
  
  // If no enclosure, try to extract from description
  if (item.description) {
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const description = item.description.toString();
    const match = imgRegex.exec(description);
    
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Return a default image if none found
  return 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=800';
};

// Function to extract the summary from description
const extractSummary = (description: string): string => {
  // Remove HTML tags and extract text
  const text = description.replace(/<[^>]*>?/gm, '');
  // Remove TrendHunter.com reference
  const cleaned = text.replace(/\(TrendHunter\.com\)/, '').trim();
  // Limit to 300 characters for summary
  return cleaned.substring(0, 300) + (cleaned.length > 300 ? '...' : '');
};

// Function to extract category and tags from title and description
const extractCategoryAndTags = (title: string, description: string): { category: string; tags: string[] } => {
  // Clean up the data
  const cleanTitle = title.replace(/\<\!\[CDATA\[ |\(TrendHunter\.com\)|\]\]\>/g, '').trim();
  const cleanDescription = description.replace(/<[^>]*>?/gm, '');
  const combinedText = `${cleanTitle} ${cleanDescription}`;
  
  // Default values
  let category = 'Technology';
  const tags: string[] = [];
  
  // List of possible categories to check for
  const possibleCategories = [
    'Technology', 'Business', 'Science', 'Health', 'Food & Beverage', 
    'Fashion', 'Lifestyle', 'Travel', 'Entertainment', 'Sports'
  ];
  
  // Check content for category matches
  for (const cat of possibleCategories) {
    if (combinedText.toLowerCase().includes(cat.toLowerCase())) {
      category = cat;
      tags.push(cat);
      break;
    }
  }
  
  // Extract some keywords as tags
  const commonKeywords = [
    'AI', 'Digital', 'Innovation', 'Sustainable', 'Health', 'Wellness', 
    'Technology', 'Trend', 'Future', 'Design', 'Smart', 'Automation',
    'Healthcare', 'Finance', 'Marketing', 'Food', 'Beverage', 'Research'
  ];
  
  commonKeywords.forEach(keyword => {
    if (combinedText.toLowerCase().includes(keyword.toLowerCase()) && !tags.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  // Ensure we have at least 2 tags
  if (tags.length < 2) {
    tags.push('Trending');
    tags.push('Innovation');
  }
  
  return { category, tags: tags.slice(0, 5) }; // Limit to 5 tags
};

// Function to create fallback trends when feed parsing fails
const createFallbackTrends = (): ITrend[] => {
  return [
    {
      _id: `fallback-${Date.now()}-1`,
      title: 'AI-Powered Customer Service Solutions',
      slug: 'ai-powered-customer-service-solutions',
      summary: 'New AI systems are revolutionizing customer service with faster response times and personalized interactions.',
      content: '<h2>AI Transforms Customer Service</h2><p>Companies are increasingly adopting AI-powered solutions for customer service, resulting in faster resolution times and higher customer satisfaction scores.</p><p>These systems can analyze customer history, predict needs, and provide personalized responses at scale.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=800',
      category: 'Technology',
      tags: ['AI', 'Customer Service', 'Innovation', 'Technology', 'Business'],
      source: 'TrendHunter (Fallback)',
      sourceUrl: 'https://www.trendhunter.com',
      publishedAt: new Date(),
      popularity: 95,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      _id: `fallback-${Date.now()}-2`,
      title: 'Sustainable Packaging Innovations',
      slug: 'sustainable-packaging-innovations',
      summary: 'Brands are developing innovative biodegradable packaging solutions to reduce environmental impact.',
      content: '<h2>Eco-Friendly Packaging Revolution</h2><p>Major brands are racing to develop sustainable packaging solutions as consumers increasingly demand environmentally responsible products.</p><p>New materials derived from seaweed, mushrooms, and agricultural waste are providing viable alternatives to traditional plastics.</p>',
      imageUrl: 'https://images.unsplash.com/photo-1605600659873-d808a13e4acb?q=80&w=800',
      category: 'Business',
      tags: ['Sustainability', 'Packaging', 'Innovation', 'Environment', 'Business'],
      source: 'TrendHunter (Fallback)',
      sourceUrl: 'https://www.trendhunter.com',
      publishedAt: new Date(),
      popularity: 90,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};

export const parseTrendHunterFeed = async (feedUrl: string): Promise<ITrend[]> => {
  try {
    // Fetch the XML feed
    const response = await axios.get(feedUrl);
    
    // Parse the XML to JSON with explicit array options for items
    const parser = new xml2js.Parser({
      explicitArray: false,
      mergeAttrs: true,
      attrkey: '$',
      charkey: '_'
    });
    
    const result = await parser.parseStringPromise(response.data);
    
    // Ensure we have a valid RSS structure
    if (!result || !result.rss || !result.rss.channel) {
      console.error('Invalid RSS feed structure');
      return createFallbackTrends();
    }
    
    // Extract items from the feed
    let items = result.rss.channel.item;
    
    // If there's only one item, wrap it in an array
    if (items && !Array.isArray(items)) {
      items = [items];
    }
    
    // Check if items exist and is an array
    if (!items || !Array.isArray(items) || items.length === 0) {
      console.error('Feed does not contain expected items array or is empty');
      return createFallbackTrends();
    }
    
    console.log(`Processing ${items.length} items from TrendHunter feed`);
    
    // Convert feed items to ITrend objects
    const trends: ITrend[] = items.map((item: any, index: number) => {
      // Extract title and clean it
      const title = item.title ? item.title.toString().replace(/\<\!\[CDATA\[ |\(TrendHunter\.com\)|\]\]\>/g, '').trim() : 'Untitled Trend';
      
      // Extract description
      const description = item.description ? item.description.toString() : '';
      
      // Create a summary
      const summary = extractSummary(description);
      
      // Use description as content for now
      const content = description;
      
      // Extract image URL
      const imageUrl = extractImageUrl(item);
      
      // Extract category and tags
      const { category, tags } = extractCategoryAndTags(title, description);
      
      // Create a trend object
      const trend: ITrend = {
        _id: `th-${Date.now()}-${index}`,
        title: title,
        slug: generateSlug(title),
        summary: summary,
        content: content,
        imageUrl: imageUrl,
        category: category,
        tags: tags,
        source: 'TrendHunter',
        sourceUrl: item.link || 'https://www.trendhunter.com',
        publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
        popularity: 95 - (index * 5), // Arbitrary popularity score
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return trend;
    });
    
    if (trends.length === 0) {
      console.warn('No trends could be extracted from feed, using fallback data');
      return createFallbackTrends();
    }
    
    return trends;
  } catch (error) {
    console.error('Error parsing TrendHunter feed:', error);
    return createFallbackTrends();
  }
};
