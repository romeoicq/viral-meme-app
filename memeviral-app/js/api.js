// API Configuration
const API_CONFIG = {
    IMGFLIP_BASE: 'https://api.imgflip.com',
    endpoints: {
        getMemes: '/get_memes'
    }
};

// API Class
class MemeAPI {
    constructor() {
        this.cache = new Map();
        this.lastFetch = 0;
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
    }

    // Fetch memes from Imgflip API
    async fetchMemes() {
        try {
            // Check cache first
            const now = Date.now();
            if (this.cache.has('memes') && (now - this.lastFetch) < this.cacheDuration) {
                console.log('📁 Using cached memes');
                return this.cache.get('memes');
            }

            console.log('🔄 Fetching fresh memes from Imgflip...');
            
            const response = await fetch(`${API_CONFIG.IMGFLIP_BASE}${API_CONFIG.endpoints.getMemes}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error('API returned unsuccessful response');
            }

            // Process and enhance meme data
            const processedMemes = this.processMemes(data.data.memes);
            
            // Cache the results
            this.cache.set('memes', processedMemes);
            this.lastFetch = now;
            
            console.log(`✅ Successfully loaded ${processedMemes.length} memes`);
            return processedMemes;
            
        } catch (error) {
            console.error('❌ Error fetching memes:', error);
            
            // Return fallback memes if API fails
            return this.getFallbackMemes();
        }
    }

    // Process raw meme data
    processMemes(rawMemes) {
        return rawMemes.map((meme, index) => ({
            id: meme.id,
            name: meme.name,
            url: meme.url,
            width: meme.width,
            height: meme.height,
            shareCount: this.generateShareCount(meme.captions || 0),
            isViral: (meme.captions || 0) > 500000,
            category: this.categorize(meme.name),
            processedAt: Date.now()
        }));
    }

    // Generate realistic share counts
    generateShareCount(captions) {
        // Convert captions to shares (roughly 1:10 ratio)
        const baseShares = Math.floor(captions / 10);
        // Add some randomness
        const variation = Math.floor(Math.random() * 1000);
        return Math.max(100, baseShares + variation);
    }

    // Categorize memes
    categorize(name) {
        const viral = ['Drake', 'Distracted Boyfriend', 'Two Buttons', 'Expanding Brain'];
        const fresh = ['Always Has Been', 'Trade Offer', 'Buff Doge'];
        
        if (viral.some(keyword => name.includes(keyword))) return 'viral';
        if (fresh.some(keyword => name.includes(keyword))) return 'fresh';
        return 'all';
    }

    // Fallback memes if API fails
    getFallbackMemes() {
        return [
            {
                id: '181913649',
                name: 'Drake Hotline Bling',
                url: 'https://i.imgflip.com/30b1gx.jpg',
                width: 1200,
                height: 1200,
                shareCount: 45230,
                isViral: true,
                category: 'viral'
            },
            {
                id: '87743020',
                name: 'Two Buttons',
                url: 'https://i.imgflip.com/1g8my4.jpg',
                width: 600,
                height: 908,
                shareCount: 32150,
                isViral: true,
                category: 'viral'
            },
            {
                id: '112126428',
                name: 'Distracted Boyfriend',
                url: 'https://i.imgflip.com/1ur9b0.jpg',
                width: 1200,
                height: 800,
                shareCount: 38920,
                isViral: true,
                category: 'viral'
            }
        ];
    }

    // Filter memes by category
    filterMemes(memes, category) {
        if (category === 'all') return memes;
        if (category === 'viral') return memes.filter(meme => meme.isViral);
        if (category === 'fresh') return memes.slice(0, 20); // Latest 20
        return memes;
    }
}

// Export API instance
window.memeAPI = new MemeAPI();
