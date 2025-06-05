// Real-time meme collector using multiple sources for actual recent memes
export interface RecentMeme {
  id: string;
  title: string;
  url: string;
  imageUrl: string;
  source: string;
  publishDate: string;
  upvotes: number;
  comments: number;
  isViral: boolean;
  category: 'fresh' | 'viral' | 'all';
}

export class RealTimeMemeCollector {
  private sources = [
    {
      name: 'Reddit JSON API',
      urls: [
        'https://www.reddit.com/r/memes/hot.json?limit=25',
        'https://www.reddit.com/r/dankmemes/hot.json?limit=25', 
        'https://www.reddit.com/r/funny/hot.json?limit=25',
        'https://www.reddit.com/r/memeeconomy/hot.json?limit=15',
        'https://www.reddit.com/r/wholesomememes/hot.json?limit=15'
      ]
    }
  ];

  async fetchRecentMemes(): Promise<RecentMeme[]> {
    console.log('🔄 Fetching actual recent memes from Reddit JSON API...');
    
    const allMemes: RecentMeme[] = [];
    
    for (const source of this.sources) {
      for (const url of source.urls) {
        try {
          const memes = await this.fetchFromRedditJson(url);
          allMemes.push(...memes);
          console.log(`✅ Fetched ${memes.length} memes from ${url}`);
        } catch (error) {
          console.error(`❌ Failed to fetch from ${url}:`, error);
        }
      }
    }

    // Sort by recency and remove duplicates
    const recentMemes = this.deduplicateAndSort(allMemes);
    console.log(`🎉 Total recent memes collected: ${recentMemes.length}`);
    
    return recentMemes.slice(0, 100); // Limit to 100 most recent
  }

  private async fetchFromRedditJson(url: string): Promise<RecentMeme[]> {
    // Try proxy approach first for better reliability in production
    try {
      console.log(`🔄 Fetching via proxy: ${url}`);
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const proxyResponse = await fetch(proxyUrl, {
        headers: {
          'Accept': 'application/json',
        },
        method: 'GET'
      });
      
      if (!proxyResponse.ok) {
        throw new Error(`Proxy failed: ${proxyResponse.status}`);
      }
      
      const proxyData = await proxyResponse.json();
      if (!proxyData.contents) {
        throw new Error('No content in proxy response');
      }
      
      const data = JSON.parse(proxyData.contents);
      console.log(`✅ Successfully fetched via proxy: ${data.data?.children?.length || 0} posts`);
      return this.processRedditData(data, url);
      
    } catch (proxyError) {
      console.error(`❌ Proxy failed: ${proxyError}`);
      
      // Fallback to direct approach
      try {
        console.log(`🔄 Trying direct fetch: ${url}`);
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
          },
          method: 'GET'
        });

        if (!response.ok) {
          throw new Error(`Direct fetch failed: ${response.status}`);
        }

        const data = await response.json();
        console.log(`✅ Successfully fetched directly: ${data.data?.children?.length || 0} posts`);
        return this.processRedditData(data, url);
        
      } catch (directError) {
        console.error(`❌ Both proxy and direct failed:`, { proxyError, directError });
        throw new Error(`All methods failed: ${directError}`);
      }
    }
  }

  private processRedditData(data: any, sourceUrl: string): RecentMeme[] {
    const posts = data?.data?.children || [];
    
    const memes: RecentMeme[] = [];
    
    for (const post of posts) {
      const postData = post.data;
      
      if (!postData || postData.is_self || !postData.url) continue;
      
      // Check if it's an image post
      const imageUrl = this.extractImageUrl(postData);
      if (!imageUrl) continue;
      
      // Calculate hours since posted
      const hoursOld = this.getHoursOld(postData.created_utc);
      
      // Only include memes from last 48 hours for true freshness
      if (hoursOld > 48) continue;
      
      memes.push({
        id: `reddit-${postData.id}`,
        title: this.cleanTitle(postData.title),
        url: `https://reddit.com${postData.permalink}`,
        imageUrl: imageUrl,
        source: this.getSubredditName(sourceUrl),
        publishDate: new Date(postData.created_utc * 1000).toISOString(),
        upvotes: postData.ups || 0,
        comments: postData.num_comments || 0,
        isViral: this.determineViralStatus(postData.ups, hoursOld),
        category: this.categorizeByAge(hoursOld, postData.ups)
      });
    }
    
    return memes;
  }

  private extractImageUrl(postData: any): string | null {
    // Direct image URLs
    if (postData.url && this.isDirectImage(postData.url)) {
      return postData.url;
    }
    
    // Reddit preview images
    if (postData.preview?.images?.[0]?.source?.url) {
      return postData.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    
    // Reddit gallery (first image)
    if (postData.is_gallery && postData.media_metadata) {
      const firstImageId = Object.keys(postData.media_metadata)[0];
      const firstImage = postData.media_metadata[firstImageId];
      if (firstImage?.s?.u) {
        return firstImage.s.u.replace(/&amp;/g, '&');
      }
    }
    
    // i.redd.it images
    if (postData.url && postData.url.includes('i.redd.it')) {
      return postData.url;
    }
    
    return null;
  }

  private isDirectImage(url: string): boolean {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext)) ||
           url.includes('i.imgur.com') ||
           url.includes('i.redd.it');
  }

  private getHoursOld(createdUtc: number): number {
    const now = Date.now() / 1000;
    return (now - createdUtc) / 3600;
  }

  private determineViralStatus(upvotes: number, hoursOld: number): boolean {
    // Consider viral based on upvotes per hour
    const upvotesPerHour = upvotes / Math.max(hoursOld, 1);
    return upvotesPerHour > 100 || upvotes > 5000;
  }

  private categorizeByAge(hoursOld: number, upvotes: number): 'fresh' | 'viral' | 'all' {
    if (hoursOld < 6) return 'fresh'; // Less than 6 hours old
    if (upvotes > 3000) return 'viral'; // High engagement
    return 'all';
  }

  private getSubredditName(url: string): string {
    const match = url.match(/\/r\/([^\/]+)/);
    return match ? `r/${match[1]}` : 'Reddit';
  }

  private cleanTitle(title: string): string {
    return title
      .replace(/\[.*?\]/g, '') // Remove brackets
      .replace(/\(.*?\)/g, '') // Remove parentheses  
      .trim()
      .substring(0, 120); // Limit length
  }

  private deduplicateAndSort(memes: RecentMeme[]): RecentMeme[] {
    // Remove duplicates based on image URL
    const seen = new Set<string>();
    const uniqueMemes = memes.filter(meme => {
      if (seen.has(meme.imageUrl)) return false;
      seen.add(meme.imageUrl);
      return true;
    });

    // Sort by publication date (newest first)
    return uniqueMemes.sort((a, b) => 
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }

  // Get time-based fresh indicator
  getTimeSincePosted(publishDate: string): string {
    const posted = new Date(publishDate);
    const now = new Date();
    const diffMs = now.getTime() - posted.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  }
}

export const realTimeMemeCollector = new RealTimeMemeCollector();
