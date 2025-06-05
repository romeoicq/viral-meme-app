import xml2js from 'xml2js';

export interface MemeSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'reddit' | 'api';
  enabled: boolean;
  lastFetch?: Date;
}

export interface FetchedMeme {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  source: string;
  sourceUrl: string;
  publishDate: Date;
  upvotes?: number;
  comments?: number;
  tags?: string[];
}

export class MemeAggregator {
  private sources: MemeSource[] = [
    {
      id: 'reddit-memes',
      name: 'Reddit r/memes',
      url: 'https://www.reddit.com/r/memes/.rss',
      type: 'reddit',
      enabled: true
    },
    {
      id: 'reddit-dankmemes',
      name: 'Reddit r/dankmemes',
      url: 'https://www.reddit.com/r/dankmemes/.rss',
      type: 'reddit',
      enabled: true
    },
    {
      id: 'reddit-funny',
      name: 'Reddit r/funny',
      url: 'https://www.reddit.com/r/funny/.rss',
      type: 'reddit',
      enabled: true
    },
    {
      id: 'reddit-wholesomememes',
      name: 'Reddit r/wholesomememes',
      url: 'https://www.reddit.com/r/wholesomememes/.rss',
      type: 'reddit',
      enabled: true
    },
    {
      id: 'imgflip-featured',
      name: 'Imgflip Featured',
      url: 'https://api.imgflip.com/get_memes',
      type: 'api',
      enabled: true
    }
  ];

  async fetchAllSources(): Promise<FetchedMeme[]> {
    console.log('🔄 Starting daily meme aggregation...');
    const allMemes: FetchedMeme[] = [];
    
    for (const source of this.sources.filter(s => s.enabled)) {
      try {
        console.log(`📡 Fetching from ${source.name}...`);
        const memes = await this.fetchFromSource(source);
        allMemes.push(...memes);
        console.log(`✅ Fetched ${memes.length} memes from ${source.name}`);
      } catch (error) {
        console.error(`❌ Error fetching from ${source.name}:`, error);
      }
    }

    // Remove duplicates and sort by freshness
    const uniqueMemes = this.deduplicateMemes(allMemes);
    const sortedMemes = uniqueMemes.sort((a, b) => 
      b.publishDate.getTime() - a.publishDate.getTime()
    );

    console.log(`🎉 Total unique memes fetched: ${sortedMemes.length}`);
    return sortedMemes;
  }

  private async fetchFromSource(source: MemeSource): Promise<FetchedMeme[]> {
    switch (source.type) {
      case 'reddit':
        return this.fetchFromRedditRSS(source);
      case 'api':
        return this.fetchFromImgflipAPI(source);
      default:
        return [];
    }
  }

  private async fetchFromRedditRSS(source: MemeSource): Promise<FetchedMeme[]> {
    try {
      const response = await fetch(source.url, {
        headers: {
          'User-Agent': 'MemeViral/1.0 (Meme Aggregator Bot)'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const xmlText = await response.text();
      const parser = new xml2js.Parser({
        explicitArray: false,
        ignoreAttrs: false
      });
      
      const result = await parser.parseStringPromise(xmlText);
      const items = result.feed?.entry || [];
      
      if (!Array.isArray(items)) {
        return items ? [items] : [];
      }

      const memes: FetchedMeme[] = [];
      
      for (const item of items.slice(0, 20)) { // Limit to 20 per source
        try {
          const imageUrl = this.extractRedditImageUrl(item);
          if (imageUrl && this.isValidMemeImage(imageUrl)) {
            memes.push({
              id: this.generateMemeId(item.id || item.link?.['@_href'] || ''),
              title: this.cleanTitle(item.title || 'Untitled Meme'),
              url: item.link?.['@_href'] || '',
              imageUrl: imageUrl,
              source: source.name,
              sourceUrl: source.url,
              publishDate: new Date(item.updated || item.published || Date.now()),
              upvotes: this.extractRedditScore(item),
              tags: this.extractTags(item.title || '')
            });
          }
        } catch (itemError) {
          console.warn('Error processing item:', itemError);
        }
      }

      return memes;
    } catch (error) {
      console.error(`Error fetching Reddit RSS from ${source.url}:`, error);
      return [];
    }
  }

  private async fetchFromImgflipAPI(source: MemeSource): Promise<FetchedMeme[]> {
    try {
      const response = await fetch(source.url);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error('Imgflip API returned error');
      }

      return data.data.memes.slice(0, 15).map((meme: any) => ({
        id: `imgflip-${meme.id}`,
        title: meme.name,
        url: `https://imgflip.com/i/${meme.id}`,
        imageUrl: meme.url,
        source: source.name,
        sourceUrl: source.url,
        publishDate: new Date(),
        upvotes: meme.captions || 0,
        tags: this.extractTags(meme.name)
      }));
    } catch (error) {
      console.error('Error fetching from Imgflip API:', error);
      return [];
    }
  }

  private extractRedditImageUrl(item: any): string | null {
    // Try multiple methods to extract image URL from Reddit RSS
    const content = item.content || item.summary || '';
    
    // Look for direct image links
    const imgRegex = /<img[^>]+src="([^"]+)"/i;
    const imgMatch = content.match(imgRegex);
    if (imgMatch) return imgMatch[1];
    
    // Look for preview images
    const previewRegex = /preview\.redd\.it\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/i;
    const previewMatch = content.match(previewRegex);
    if (previewMatch) return `https://${previewMatch[0]}`;
    
    // Look for i.redd.it links
    const iredditRegex = /i\.redd\.it\/[^"'\s]+\.(jpg|jpeg|png|gif|webp)/i;
    const iredditMatch = content.match(iredditRegex);
    if (iredditMatch) return `https://${iredditMatch[0]}`;
    
    return null;
  }

  private extractRedditScore(item: any): number {
    const content = item.content || item.summary || '';
    const scoreRegex = /(\d+)\s+upvotes/i;
    const match = content.match(scoreRegex);
    return match ? parseInt(match[1]) : 0;
  }

  private isValidMemeImage(url: string): boolean {
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUrl = url.toLowerCase();
    return validExtensions.some(ext => lowerUrl.includes(ext));
  }

  private cleanTitle(title: string): string {
    // Remove Reddit formatting and clean up title
    return title
      .replace(/\[.*?\]/g, '') // Remove brackets
      .replace(/u\/\w+/g, '') // Remove usernames
      .replace(/r\/\w+/g, '') // Remove subreddit names
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 100); // Limit length
  }

  private extractTags(title: string): string[] {
    const tags: string[] = [];
    const lowerTitle = title.toLowerCase();
    
    // Common meme tags
    if (lowerTitle.includes('oc') || lowerTitle.includes('original')) tags.push('original');
    if (lowerTitle.includes('meta')) tags.push('meta');
    if (lowerTitle.includes('dank')) tags.push('dank');
    if (lowerTitle.includes('wholesome')) tags.push('wholesome');
    if (lowerTitle.includes('funny')) tags.push('funny');
    if (lowerTitle.includes('relatable')) tags.push('relatable');
    
    return tags;
  }

  private generateMemeId(source: string): string {
    return `meme-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private deduplicateMemes(memes: FetchedMeme[]): FetchedMeme[] {
    const seen = new Set<string>();
    return memes.filter(meme => {
      const key = `${meme.imageUrl}-${meme.title}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Get enabled sources
  getSources(): MemeSource[] {
    return this.sources;
  }

  // Update source status
  updateSource(id: string, updates: Partial<MemeSource>): void {
    const index = this.sources.findIndex(s => s.id === id);
    if (index !== -1) {
      this.sources[index] = { ...this.sources[index], ...updates };
    }
  }
}

export const memeAggregator = new MemeAggregator();
