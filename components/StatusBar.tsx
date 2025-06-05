import React from 'react';

interface StatusBarProps {
  statusMessage: string;
  shareCount: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ 
  statusMessage, 
  shareCount 
}) => {
  return (
    <div className="relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 animate-pulse"></div>
      <div className="relative flex justify-between items-center px-6 py-4 bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center gap-6">
          {/* Status with icon */}
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
            <span className="font-medium text-white/90">{statusMessage}</span>
          </div>
          
          {/* Share count with enhanced styling */}
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            <span className="text-orange-300">🔥</span>
            <span className="font-bold text-orange-200">{shareCount} shares today</span>
          </div>
        </div>
        
        {/* Enhanced tip section */}
        <div className="flex items-center gap-2 text-white/80">
          <span className="animate-bounce">👆</span>
          <span className="font-medium">Tap share buttons to spread the fun!</span>
        </div>
      </div>
    </div>
  );
};
