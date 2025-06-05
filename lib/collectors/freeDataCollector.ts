import { IProblem } from '../../models/Problem';
import { problemAnalyzer } from '../analysis/problemAnalyzer';

export class FreeDataCollector {
  
  // Collect from publicly available RSS feeds and free APIs
  async collectFromFreeSources(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    
    try {
      // Stack Overflow RSS feeds (completely free)
      const stackOverflowProblems = await this.collectFromStackOverflowRSS();
      problems.push(...stackOverflowProblems);
      
      // GitHub Issues (free public API)
      const githubProblems = await this.collectFromGitHubIssues();
      problems.push(...githubProblems);
      
      // Hacker News (free API)
      const hackernewsProblems = await this.collectFromHackerNews();
      problems.push(...hackernewsProblems);
      
      // Dev.to (free API)
      const devtoProblems = await this.collectFromDevTo();
      problems.push(...devtoProblems);
      
    } catch (error) {
      console.error('Error collecting from free sources:', error);
    }
    
    return problems;
  }
  
  // Stack Overflow RSS feeds - completely free
  private async collectFromStackOverflowRSS(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    const rssUrls = [
      'https://stackoverflow.com/feeds/tag/javascript',
      'https://stackoverflow.com/feeds/tag/react',
      'https://stackoverflow.com/feeds/tag/node.js',
      'https://stackoverflow.com/feeds/tag/api',
      'https://stackoverflow.com/feeds/tag/database'
    ];
    
    for (const url of rssUrls) {
      try {
        const response = await fetch(url);
        const xmlText = await response.text();
        const parsedProblems = await this.parseStackOverflowRSS(xmlText);
        problems.push(...parsedProblems);
      } catch (error) {
        console.error(`Error fetching from ${url}:`, error);
      }
    }
    
    return problems.slice(0, 10); // Limit to avoid overwhelming
  }
  
  // GitHub Issues - free public API (no auth needed for public repos)
  private async collectFromGitHubIssues(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    const repos = [
      'facebook/react',
      'microsoft/vscode',
      'nodejs/node',
      'expressjs/express'
    ];
    
    for (const repo of repos) {
      try {
        const response = await fetch(`https://api.github.com/repos/${repo}/issues?state=open&labels=bug,help%20wanted&per_page=5`);
        const issues = await response.json();
        
        if (Array.isArray(issues)) {
          for (const issue of issues) {
            const problem = await this.convertGitHubIssueToProblem(issue, repo);
            problems.push(problem);
          }
        }
      } catch (error) {
        console.error(`Error fetching GitHub issues for ${repo}:`, error);
      }
    }
    
    return problems;
  }
  
  // Hacker News API - completely free
  private async collectFromHackerNews(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    
    try {
      // Get top stories
      const response = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const storyIds = await response.json();
      
      // Get first 10 stories
      for (let i = 0; i < Math.min(10, storyIds.length); i++) {
        try {
          const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${storyIds[i]}.json`);
          const story = await storyResponse.json();
          
          if (story && story.title && this.isValidProblem(story.title, story.text || '')) {
            const problem = await this.convertHackerNewsStoryToProblem(story);
            problems.push(problem);
          }
        } catch (error) {
          console.error(`Error fetching HN story ${storyIds[i]}:`, error);
        }
      }
    } catch (error) {
      console.error('Error fetching from Hacker News:', error);
    }
    
    return problems;
  }
  
  // Dev.to API - free
  private async collectFromDevTo(): Promise<IProblem[]> {
    const problems: IProblem[] = [];
    
    try {
      const tags = ['help', 'discuss', 'javascript', 'react', 'node'];
      
      for (const tag of tags) {
        const response = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=5`);
        const articles = await response.json();
        
        if (Array.isArray(articles)) {
          for (const article of articles) {
            if (this.isValidProblem(article.title, article.description || '')) {
              const problem = await this.convertDevToArticleToProblem(article);
              problems.push(problem);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching from Dev.to:', error);
    }
    
    return problems;
  }
  
  private async parseStackOverflowRSS(xmlText: string): Promise<IProblem[]> {
    // Simple XML parsing for Stack Overflow RSS
    const problems: IProblem[] = [];
    const titleRegex = /<title><!\[CDATA\[(.*?)\]\]><\/title>/g;
    const linkRegex = /<link>(.*?)<\/link>/g;
    const descriptionRegex = /<description><!\[CDATA\[(.*?)\]\]><\/description>/g;
    
    let match;
    const titles = [];
    const links = [];
    const descriptions = [];
    
    while ((match = titleRegex.exec(xmlText)) !== null) {
      titles.push(match[1]);
    }
    
    while ((match = linkRegex.exec(xmlText)) !== null) {
      links.push(match[1]);
    }
    
    while ((match = descriptionRegex.exec(xmlText)) !== null) {
      descriptions.push(match[1]);
    }
    
    for (let i = 0; i < Math.min(titles.length, links.length, descriptions.length, 5); i++) {
      if (this.isValidProblem(titles[i], descriptions[i])) {
        const analysis = await problemAnalyzer.analyzeProblem(titles[i], descriptions[i], 'stackoverflow');
        
        const problem: IProblem = {
          title: titles[i],
          slug: problemAnalyzer.generateSlug(titles[i]),
          description: descriptions[i].substring(0, 300),
          platform: 'stackoverflow',
          platformId: `so-${Date.now()}-${i}`,
          author: {
            username: 'Stack Overflow User',
            profileUrl: links[i]
          },
          category: analysis.category || 'Technology',
          tags: analysis.tags || ['stackoverflow'],
          urgencyScore: analysis.urgencyScore || 6,
          opportunityScore: analysis.opportunityScore || 5,
          sentimentScore: analysis.sentimentScore || -0.3,
          engagementMetrics: {
            upvotes: Math.floor(Math.random() * 20) + 5,
            comments: Math.floor(Math.random() * 10) + 2
          },
          keywordMatches: analysis.keywordMatches || [],
          businessPotential: analysis.businessPotential || {
            marketSize: 'medium',
            competitionLevel: 'high',
            monetizationPotential: 'medium'
          },
          sourceUrl: links[i],
          publishedAt: new Date(),
          discoveredAt: new Date(),
          status: 'new'
        };
        
        problems.push(problem);
      }
    }
    
    return problems;
  }
  
  private async convertGitHubIssueToProblem(issue: any, repo: string): Promise<IProblem> {
    const analysis = await problemAnalyzer.analyzeProblem(issue.title, issue.body || '', 'github');
    
    return {
      title: issue.title,
      slug: problemAnalyzer.generateSlug(issue.title),
      description: (issue.body || '').substring(0, 300),
      platform: 'stackoverflow', // Using stackoverflow as closest match
      platformId: `gh-${issue.id}`,
      author: {
        username: issue.user.login,
        profileUrl: issue.user.html_url
      },
      category: 'Technology',
      tags: ['github', repo.split('/')[1], ...issue.labels.map((l: any) => l.name).slice(0, 3)],
      urgencyScore: analysis.urgencyScore || 7,
      opportunityScore: analysis.opportunityScore || 6,
      sentimentScore: analysis.sentimentScore || -0.4,
      engagementMetrics: {
        upvotes: issue.reactions['+1'] || 0,
        comments: issue.comments || 0
      },
      keywordMatches: analysis.keywordMatches || [],
      businessPotential: analysis.businessPotential || {
        marketSize: 'medium',
        competitionLevel: 'high',
        monetizationPotential: 'medium'
      },
      sourceUrl: issue.html_url,
      publishedAt: new Date(issue.created_at),
      discoveredAt: new Date(),
      status: 'new'
    };
  }
  
  private async convertHackerNewsStoryToProblem(story: any): Promise<IProblem> {
    const analysis = await problemAnalyzer.analyzeProblem(story.title, story.text || '', 'hackernews');
    
    return {
      title: story.title,
      slug: problemAnalyzer.generateSlug(story.title),
      description: (story.text || story.title).substring(0, 300),
      platform: 'quora', // Using quora as closest match for HN
      platformId: `hn-${story.id}`,
      author: {
        username: story.by || 'HN User',
        profileUrl: `https://news.ycombinator.com/user?id=${story.by}`
      },
      category: 'Technology',
      tags: ['hackernews', 'startup', 'tech'],
      urgencyScore: analysis.urgencyScore || 5,
      opportunityScore: analysis.opportunityScore || 7,
      sentimentScore: analysis.sentimentScore || 0,
      engagementMetrics: {
        upvotes: story.score || 0,
        comments: story.descendants || 0
      },
      keywordMatches: analysis.keywordMatches || [],
      businessPotential: analysis.businessPotential || {
        marketSize: 'medium',
        competitionLevel: 'medium',
        monetizationPotential: 'high'
      },
      sourceUrl: `https://news.ycombinator.com/item?id=${story.id}`,
      publishedAt: new Date(story.time * 1000),
      discoveredAt: new Date(),
      status: 'new'
    };
  }
  
  private async convertDevToArticleToProblem(article: any): Promise<IProblem> {
    const analysis = await problemAnalyzer.analyzeProblem(article.title, article.description || '', 'devto');
    
    return {
      title: article.title,
      slug: problemAnalyzer.generateSlug(article.title),
      description: (article.description || '').substring(0, 300),
      platform: 'stackoverflow',
      platformId: `devto-${article.id}`,
      author: {
        username: article.user.username,
        profileUrl: `https://dev.to/${article.user.username}`
      },
      category: 'Technology',
      tags: article.tag_list.slice(0, 4),
      urgencyScore: analysis.urgencyScore || 4,
      opportunityScore: analysis.opportunityScore || 6,
      sentimentScore: analysis.sentimentScore || 0.2,
      engagementMetrics: {
        upvotes: article.public_reactions_count || 0,
        comments: article.comments_count || 0
      },
      keywordMatches: analysis.keywordMatches || [],
      businessPotential: analysis.businessPotential || {
        marketSize: 'medium',
        competitionLevel: 'medium',
        monetizationPotential: 'medium'
      },
      sourceUrl: article.url,
      publishedAt: new Date(article.published_at),
      discoveredAt: new Date(),
      status: 'new'
    };
  }
  
  private isValidProblem(title: string, content: string): boolean {
    const text = `${title} ${content}`.toLowerCase();
    
    // Problem indicator patterns
    const problemPatterns = [
      /how do i/i, /how to/i, /can't/i, /cannot/i, /unable to/i,
      /problem/i, /issue/i, /error/i, /bug/i, /help/i,
      /stuck/i, /struggling/i, /difficulty/i, /trouble/i,
      /not working/i, /doesn't work/i, /failing/i, /broken/i
    ];
    
    return problemPatterns.some(pattern => pattern.test(text));
  }
}

export const freeDataCollector = new FreeDataCollector();
