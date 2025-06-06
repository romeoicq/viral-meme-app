// Sharing functionality
class SharingManager {
    constructor() {
        this.appName = 'MemeViral';
        this.appUrl = 'https://memeviral.app';
        this.shareStats = this.loadShareStats();
    }

    // Share to WhatsApp
    shareToWhatsApp(meme) {
        const text = encodeURIComponent(
            `Check out this hilarious meme: "${meme.name}"\n\n${this.appUrl}`
        );
        window.open(`https://wa.me/?text=${text}`, '_blank');
        this.trackShare(meme.id, 'whatsapp');
    }

    // Share to Twitter
    shareToTwitter(meme) {
        const text = encodeURIComponent(`"${meme.name}" 😂`);
        const url = encodeURIComponent(this.appUrl);
        const hashtags = encodeURIComponent('memes,funny,viral');
        window.open(
            `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
            '_blank'
        );
        this.trackShare(meme.id, 'twitter');
    }

    // Share to Facebook
    shareToFacebook(meme) {
        const url = encodeURIComponent(this.appUrl);
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            '_blank'
        );
        this.trackShare(meme.id, 'facebook');
    }

    // Download meme with watermark
    async downloadMeme(meme) {
        try {
            // Create canvas for watermarking
            const canvas = await this.createWatermarkedImage(meme);
            
            // Download the image
            const link = document.createElement('a');
            link.download = `${meme.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_memeviral.jpg`;
            link.href = canvas.toDataURL('image/jpeg', 0.9);
            link.click();
            
            this.trackShare(meme.id, 'download');
            
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: open image in new tab
            window.open(meme.url, '_blank');
        }
    }

    // Create watermarked image
    async createWatermarkedImage(meme) {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                try {
                    // Set canvas size
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // Draw original image
                    ctx.drawImage(img, 0, 0);
                    
                    // Add watermark
                    this.addWatermark(ctx, canvas.width, canvas.height);
                    
                    resolve(canvas);
                } catch (error) {
                    reject(error);
                }
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = meme.url;
        });
    }

    // Add watermark to canvas
    addWatermark(ctx, width, height) {
        // Semi-transparent background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(width - 200, height - 40, 190, 30);
        
        // Watermark text
        ctx.font = 'bold 16px Arial';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('MemeViral.app', width - 105, height - 20);
        
        // Small logo emoji
        ctx.font = '20px Arial';
        ctx.fillText('😆', width - 170, height - 15);
    }

    // Track sharing activity
    trackShare(memeId, platform) {
        const today = new Date().toDateString();
        
        if (!this.shareStats[today]) {
            this.shareStats[today] = { total: 0, platforms: {} };
        }
        
        this.shareStats[today].total++;
        this.shareStats[today].platforms[platform] = 
            (this.shareStats[today].platforms[platform] || 0) + 1;
        
        this.saveShareStats();
        this.updateShareDisplay();
        
        // Simulate viral growth
        this.simulateViralGrowth(memeId);
    }

    // Load share stats from localStorage
    loadShareStats() {
        try {
            return JSON.parse(localStorage.getItem('memeviralStats') || '{}');
        } catch {
            return {};
        }
    }

    // Save share stats to localStorage
    saveShareStats() {
        localStorage.setItem('memeviralStats', JSON.stringify(this.shareStats));
    }

    // Update share count display
    updateShareDisplay() {
        const today = new Date().toDateString();
        const todayStats = this.shareStats[today] || { total: 0 };
        const shareCountEl = document.getElementById('share-count');
        if (shareCountEl) {
            shareCountEl.textContent = `${todayStats.total} shares today`;
        }
    }

    // Simulate viral growth for engagement
    simulateViralGrowth(memeId) {
        const memeCard = document.querySelector(`[data-meme-id="${memeId}"]`);
        if (memeCard) {
            const shareCountEl = memeCard.querySelector('.share-count');
            if (shareCountEl) {
                const currentCount = parseInt(shareCountEl.textContent.replace(/\D/g, '')) || 0;
                const newCount = currentCount + Math.floor(Math.random() * 5) + 1;
                shareCountEl.textContent = `${newCount.toLocaleString()} shares`;
                
                // Add viral badge if threshold reached
                if (newCount > 50000 && !memeCard.querySelector('.viral-badge')) {
                    this.addViralBadge(memeCard);
                }
            }
        }
    }

    // Add viral badge to meme
    addViralBadge(memeCard) {
        const statsEl = memeCard.querySelector('.meme-stats');
        if (statsEl && !statsEl.querySelector('.viral-badge')) {
            const badge = document.createElement('span');
            badge.className = 'viral-badge';
            badge.textContent = '🔥 VIRAL';
            statsEl.appendChild(badge);
        }
    }

    // Copy link to clipboard
    async copyLink(meme) {
        try {
            await navigator.clipboard.writeText(`${this.appUrl}?meme=${meme.id}`);
            this.showToast('Link copied to clipboard!');
            this.trackShare(meme.id, 'copy');
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    }

    // Show toast notification
    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }
}

// Export sharing manager
window.sharingManager = new SharingManager();
