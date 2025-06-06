import React, { useState } from 'react';
import Image from 'next/image';

interface Meme {
  id: string;
  name: string;
  url: string;
  width: number;
  height: number;
  shareCount: number;
  isViral: boolean;
  category: 'all' | 'viral' | 'fresh';
  processedAt: number;
  timeAgo?: string;
  source?: string;
  redditUrl?: string;
}

interface MemeCardProps {
  meme: Meme;
  onShare: (memeId: string, platform: string) => void;
}

export const MemeCard: React.FC<MemeCardProps> = ({ meme, onShare }) => {
  const [imageError, setImageError] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showAllShares, setShowAllShares] = useState(false);

  const appBaseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://viral-meme-app.vercel.app';
  const memeUrl = `${appBaseUrl}/memes?id=${meme.id}`; // Use /memes route with ID
  const memeText = `Check out this hilarious meme: "${meme.name}"`;

  // Share functions for different platforms
  const shareToX = () => {
    console.log('Attempting to share to X (Twitter)');
    try {
      const text = encodeURIComponent(`${meme.name} 😂`);
      const url = encodeURIComponent(memeUrl);
      const hashtags = encodeURIComponent('memes,funny,viral,comedy');
      window.open(
        `https://twitter.com/intent/tweet?text=${text}&url=${url}&hashtags=${hashtags}`,
        '_blank'
      );
      onShare(meme.id, 'x-twitter');
    } catch (error) {
      console.error('Error sharing to X:', error);
      alert('Failed to open X share window. Please check pop-up blockers.');
    }
  };

  const shareToFacebook = () => {
    console.log('Attempting to share to Facebook');
    try {
      const url = encodeURIComponent(memeUrl);
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${url}`,
        '_blank'
      );
      onShare(meme.id, 'facebook');
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      alert('Failed to open Facebook share window. Please check pop-up blockers.');
    }
  };

  const shareToTikTok = () => {
    console.log('Attempting to share to TikTok');
    try {
      const text = `${memeText}\n\n💫 Create your TikTok with this meme: ${memeUrl}\n\n#memes #funny #viral #comedy`;
      navigator.clipboard.writeText(text).then(() => {
        alert('📱 TikTok share text copied! Paste it in your TikTok caption and add the meme as your background.');
      }).catch(err => {
        console.error('Failed to copy TikTok text:', err);
        alert('Failed to copy TikTok text. Please try manually copying.');
      });
      onShare(meme.id, 'tiktok');
    } catch (error) {
      console.error('Error sharing to TikTok:', error);
      alert('Failed to prepare TikTok share. Please try manually copying.');
    }
  };

  const shareToInstagram = () => {
    console.log('Attempting to share to Instagram');
    try {
      const text = `${meme.name} 😂\n\n#memes #funny #viral #comedy #memeviral\n\n📱 Get more memes at: ${memeUrl}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('📸 Instagram caption copied! Download the meme and post with this caption.');
      }).catch(err => {
        console.error('Failed to copy Instagram text:', err);
        alert('Failed to copy Instagram text. Please try manually copying.');
      });
      onShare(meme.id, 'instagram');
    } catch (error) {
      console.error('Error sharing to Instagram:', error);
      alert('Failed to prepare Instagram share. Please try manually copying.');
    }
  };

  const shareToWhatsApp = () => {
    console.log('Attempting to share to WhatsApp');
    try {
      const text = encodeURIComponent(`${memeText}\n\n${memeUrl}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
      onShare(meme.id, 'whatsapp');
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      alert('Failed to open WhatsApp share window. Please check pop-up blockers.');
    }
  };

  const shareToReddit = () => {
    console.log('Attempting to share to Reddit');
    try {
      const title = encodeURIComponent(`${meme.name} 😂`);
      const url = encodeURIComponent(memeUrl);
      window.open(
        `https://www.reddit.com/submit?title=${title}&url=${url}`,
        '_blank'
      );
      onShare(meme.id, 'reddit');
    } catch (error) {
      console.error('Error sharing to Reddit:', error);
      alert('Failed to open Reddit share window. Please check pop-up blockers.');
    }
  };

  const shareToLinkedIn = () => {
    console.log('Attempting to share to LinkedIn');
    try {
      const url = encodeURIComponent(memeUrl);
      const title = encodeURIComponent(`Hilarious meme: ${meme.name}`);
      const summary = encodeURIComponent(`Check out this viral meme that's taking the internet by storm!`);
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}&summary=${summary}`,
        '_blank'
      );
      onShare(meme.id, 'linkedin');
    } catch (error) {
      console.error('Error sharing to LinkedIn:', error);
      alert('Failed to open LinkedIn share window. Please check pop-up blockers.');
    }
  };

  const shareToTelegram = () => {
    console.log('Attempting to share to Telegram');
    try {
      const text = encodeURIComponent(`${memeText}\n\n${memeUrl}`);
      window.open(`https://t.me/share/url?url=${memeUrl}&text=${text}`, '_blank');
      onShare(meme.id, 'telegram');
    } catch (error) {
      console.error('Error sharing to Telegram:', error);
      alert('Failed to open Telegram share window. Please check pop-up blockers.');
    }
  };

  const shareToDiscord = () => {
    console.log('Attempting to share to Discord');
    try {
      const text = `${memeText}\n\n${memeUrl}`;
      navigator.clipboard.writeText(text).then(() => {
        alert('🎮 Discord share text copied! Paste it in any Discord channel.');
      }).catch(err => {
        console.error('Failed to copy Discord text:', err);
        alert('Failed to copy Discord text. Please try manually copying.');
      });
      onShare(meme.id, 'discord');
    } catch (error) {
      console.error('Error sharing to Discord:', error);
      alert('Failed to prepare Discord share. Please try manually copying.');
    }
  };

  const copyLink = () => {
    console.log('Attempting to copy link');
    try {
      navigator.clipboard.writeText(memeUrl).then(() => {
        alert('🔗 Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy link:', err);
        alert('Failed to copy link. Please try manually copying.');
      });
      onShare(meme.id, 'copy-link');
    } catch (error) {
      console.error('Error copying link:', error);
      alert('Failed to copy link. Please try manually copying.');
    }
  };

  const downloadMeme = async () => {
    setIsDownloading(true);
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          
          ctx?.drawImage(img, 0, 0);
          
          if (ctx) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(img.width - 200, img.height - 40, 190, 30);
            
            ctx.font = 'bold 16px Arial';
            ctx.fillStyle = 'white';
            ctx.textAlign = 'center';
            ctx.fillText('MemeViral.app', img.width - 105, img.height - 20);
            
            ctx.font = '20px Arial';
            ctx.fillText('😆', img.width - 170, img.height - 15);
          }
          
          const link = document.createElement('a');
          link.download = `${meme.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_memeviral.jpg`;
          link.href = canvas.toDataURL('image/jpeg', 0.9);
          link.click();
          
          onShare(meme.id, 'download');
          
        } catch (error) {
          console.error('Download failed:', error);
          window.open(meme.url, '_blank');
        } finally {
          setIsDownloading(false);
        }
      };
      
      img.onerror = () => {
        setIsDownloading(false);
        window.open(meme.url, '_blank');
      };
      
      img.src = meme.url;
      
    } catch (error) {
      console.error('Download failed:', error);
      setIsDownloading(false);
      window.open(meme.url, '_blank');
    }
  };

  return (
    <div className="group bg-gradient-to-br from-white via-white to-gray-50/80 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] border border-white/30 backdrop-blur-sm relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-blue-500/5 before:via-purple-500/5 before:to-pink-500/5 before:opacity-0 hover:before:opacity-100 before:transition-all before:duration-500 before:rounded-3xl">
      {/* Meme Header */}
      <div className="p-4 pb-2">
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{meme.name}</h3>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-3 text-gray-600">
            <span className="font-semibold">{meme.shareCount.toLocaleString()} shares</span>
            {meme.timeAgo && (
              <span className="text-green-600 font-medium">🕒 {meme.timeAgo}</span>
            )}
            {meme.source && (
              <span className="text-blue-600 text-xs bg-blue-50 px-2 py-1 rounded-full">📱 {meme.source}</span>
            )}
          </div>
          {meme.isViral && (
            <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
              🔥 VIRAL
            </span>
          )}
        </div>
      </div>

      {/* Meme Image */}
      <div className="relative w-full min-h-64 bg-gray-50 flex items-center justify-center">
        {!imageError ? (
          <Image
            src={meme.url}
            alt={meme.name}
            width={meme.width}
            height={meme.height}
            className="w-full h-auto max-h-96 object-contain"
            onError={() => setImageError(true)}
            priority={false}
            unoptimized={meme.url.includes('.gif')}
          />
        ) : (
          <div className="text-gray-400 text-center p-8">
            <div className="text-4xl mb-2">🖼️</div>
            <p>Image unavailable</p>
          </div>
        )}
      </div>

      {/* Professional Share Buttons */}
      <div className="p-4">
        <div className="flex justify-center gap-4 mb-4">
          {/* WhatsApp */}
          <button
            onClick={shareToWhatsApp}
            className="w-12 h-12 bg-[#25D366] hover:bg-[#20B358] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            title="Share on WhatsApp"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
            </svg>
          </button>

          {/* X (Twitter) */}
          <button
            onClick={shareToX}
            className="w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            title="Share on X (Twitter)"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </button>

          {/* Facebook */}
          <button
            onClick={shareToFacebook}
            className="w-12 h-12 bg-[#1877F2] hover:bg-[#166FE5] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
            title="Share on Facebook"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          </button>

          {/* Download */}
          <button
            onClick={downloadMeme}
            disabled={isDownloading}
            className="w-12 h-12 bg-gray-700 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download meme"
          >
            {isDownloading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )}
          </button>
        </div>

        {/* Test Button for Debugging */}
        <button
          onClick={() => console.log('TEST BUTTON CLICKED!')}
          style={{ background: 'red', color: 'white', padding: '10px', margin: '10px', border: 'none', cursor: 'pointer' }}
        >
          TEST CLICK
        </button>

        {/* Bottom Attribution and More Options */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
          <span className="font-medium">
            @memetemplate
          </span>
          <button
            onClick={() => setShowAllShares(!showAllShares)}
            className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors duration-200 text-xs"
            title="More share options"
          >
            <span>More platforms</span>
            <svg className={`w-3 h-3 transition-transform duration-200 ${showAllShares ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Extended Share Options */}
        {showAllShares && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="grid grid-cols-5 gap-3">
              {/* Instagram */}
              <button
                onClick={shareToInstagram}
                className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                title="Share on Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </button>

              {/* TikTok */}
              <button
                onClick={shareToTikTok}
                className="w-12 h-12 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                title="Share on TikTok"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-.88-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </button>

              {/* Reddit */}
              <button
                onClick={shareToReddit}
                className="w-12 h-12 bg-[#FF4500] hover:bg-[#E63E00] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                title="Share on Reddit"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
                </svg>
              </button>

              {/* Telegram */}
              <button
                onClick={shareToTelegram}
                className="w-12 h-12 bg-[#0088CC] hover:bg-[#007BB8] text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                title="Share on Telegram"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>

              {/* Copy Link */}
              <button
                onClick={copyLink}
                className="w-12 h-12 bg-gray-500 hover:bg-gray-600 text-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
                title="Copy link"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* Viral Status Message */}
            {meme.isViral && (
              <div className="mt-4 p-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg text-center text-sm text-orange-800">
                🔥 This meme is going viral! Share it now to ride the wave!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
