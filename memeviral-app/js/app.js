// Main App Controller
class MemeViralApp {
    constructor() {
        this.currentCategory = 'all';
        this.memes = [];
        this.filteredMemes = [];
        this.isLoading = false;
        this.init();
    }

    // Initialize the app
    async init() {
        console.log('🚀 Initializing MemeViral App');
        
        this.setupEventListeners();
        this.showLoadingState();
        await this.loadMemes();
        this.hideLoadingState();
        
        // Update share display
        window.sharingManager.updateShareDisplay();
        
        console.log('✅ App initialized successfully');
    }

    // Setup event listeners
    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.switchCategory(tab.dataset.category);
            });
        });

        // Infinite scroll
        window.addEventListener('scroll', () => {
            if (this.shouldLoadMore()) {
                this.loadMoreMemes();
            }
        });

        // Refresh button
        window.refreshMemes = () => this.refreshMemes();
    }

    // Load memes from API
    async loadMemes() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.updateStatus('Loading fresh memes...');
        
        try {
            this.memes = await window.memeAPI.fetchMemes();
            this.filterAndDisplayMemes();
            this.updateStatus('Fresh memes loaded!');
            
        } catch (error) {
            console.error('Failed to load memes:', error);
            this.updateStatus('Failed to load memes');
        } finally {
            this.isLoading = false;
        }
    }

    // Filter and display memes
    filterAndDisplayMemes() {
        this.filteredMemes = window.memeAPI.filterMemes(this.memes, this.currentCategory);
        this.renderMemes();
    }

    // Render memes to the page
    renderMemes() {
        const container = document.getElementById('memes-container');
        container.innerHTML = '';
        
        this.filteredMemes.forEach(meme => {
            const memeCard = this.createMemeCard(meme);
            container.appendChild(memeCard);
        });
        
        // Add fade-in animation
        container.classList.add('fade-in');
    }

    // Create meme card element
    createMemeCard(meme) {
        const card = document.createElement('div');
        card.className = 'meme-card';
        card.dataset.memeId = meme.id;
        
        card.innerHTML = `
            <div class="meme-header">
                <div class="meme-title">${meme.name}</div>
                <div class="meme-stats">
                    <span class="share-count">${meme.shareCount.toLocaleString()} shares</span>
                    ${meme.isViral ? '<span class="viral-badge">🔥 VIRAL</span>' : ''}
                </div>
            </div>
            
            <div class="meme-image-container">
                <img class="meme-image" src="${meme.url}" alt="${meme.name}" 
                     loading="lazy" onerror="this.style.display='none'">
            </div>
            
            <div class="meme-actions">
                <div class="share-buttons">
                    <button class="share-btn whatsapp" onclick="shareMeme('${meme.id}', 'whatsapp')" title="Share on WhatsApp">
                        💬
                    </button>
                    <button class="share-btn twitter" onclick="shareMeme('${meme.id}', 'twitter')" title="Share on Twitter">
                        🐦
                    </button>
                    <button class="share-btn facebook" onclick="shareMeme('${meme.id}', 'facebook')" title="Share on Facebook">
                        📘
                    </button>
                    <button class="share-btn download" onclick="shareMeme('${meme.id}', 'download')" title="Download">
                        ⬇️
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Switch category
    switchCategory(category) {
        // Update active tab
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });
        
        this.currentCategory = category;
        this.filterAndDisplayMemes();
    }

    // Show loading state
    showLoadingState() {
        document.getElementById('loading-indicator').style.display = 'block';
    }

    // Hide loading state
    hideLoadingState() {
        document.getElementById('loading-indicator').style.display = 'none';
    }

    // Update status message
    updateStatus(message) {
        const statusEl = document.getElementById('loading-status');
        if (statusEl) {
            statusEl.textContent = message;
        }
    }

    // Check if should load more memes
    shouldLoadMore() {
        const scrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        
        return scrollTop + windowHeight >= docHeight - 1000;
    }

    // Load more memes (for infinite scroll)
    async loadMoreMemes() {
        if (this.isLoading) return;
        
        // For now, just shuffle existing memes
        // In production, you'd fetch more from API
        this.shuffleMemes();
    }

    // Shuffle memes for variety
    shuffleMemes() {
        this.filteredMemes = this.shuffleArray([...this.filteredMemes]);
        this.renderMemes();
    }

    // Utility: Shuffle array
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Refresh memes
    async refreshMemes() {
        // Clear cache
        window.memeAPI.cache.clear();
        await this.loadMemes();
    }
}

// Global sharing function
window.shareMeme = (memeId, platform) => {
    const meme = window.app.memes.find(m => m.id === memeId);
    if (!meme) return;
    
    switch (platform) {
        case 'whatsapp':
            window.sharingManager.shareToWhatsApp(meme);
            break;
        case 'twitter':
            window.sharingManager.shareToTwitter(meme);
            break;
        case 'facebook':
            window.sharingManager.shareToFacebook(meme);
            break;
        case 'download':
            window.sharingManager.downloadMeme(meme);
            break;
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new MemeViralApp();
});

// Service Worker for offline functionality (optional)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(console.error);
}
