import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Loading..." 
}) => {
  return (
    <div className="text-center py-20">
      <div className="inline-block w-12 h-12 border-4 border-white border-opacity-30 border-t-white rounded-full animate-spin mb-6"></div>
      <p className="text-lg opacity-80">{message}</p>
    </div>
  );
};
