import Link from 'next/link';
import { ITrend } from '../models/Trend';

interface TrendCardProps {
  trend: ITrend;
}

export default function TrendCard({ trend }: TrendCardProps) {
  // Format date
  const formattedDate = new Date(trend.publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Calculate popularity badge color based on popularity score
  const getPopularityColor = (score: number = 0) => {
    if (score >= 90) return 'bg-gradient-to-r from-orange-500 to-red-500';
    if (score >= 80) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    if (score >= 70) return 'bg-gradient-to-r from-green-400 to-emerald-500';
    return 'bg-gradient-to-r from-blue-400 to-blue-500';
  };

  return (
    <div className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 
                    hover:shadow-xl hover:-translate-y-1 border border-gray-200 dark:border-gray-700 group">
      <Link href={`/trends/${trend.slug}`} className="block h-full">
        {trend.imageUrl && (
          <div className="relative h-56 w-full overflow-hidden">
            <img 
              src={trend.imageUrl} 
              alt={trend.title} 
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-60"></div>
            <div className="absolute bottom-3 left-3">
              <span className="inline-block text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {trend.category}
              </span>
            </div>
            
            {trend.popularity && (
              <div className="absolute top-3 right-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold text-white ${getPopularityColor(trend.popularity)}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                  </svg>
                  {trend.popularity}%
                </span>
              </div>
            )}
          </div>
        )}
        
        <div className="p-5">
          <div className="mb-1 text-xs text-gray-500 dark:text-gray-400 flex justify-between items-center">
            <span>{trend.source}</span>
            <span>{formattedDate}</span>
          </div>
          
          <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
            {trend.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{trend.summary}</p>
          
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {trend.tags && trend.tags.slice(0, 3).map(tag => (
                <span key={tag} className="inline-block text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            
            <span className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium group-hover:translate-x-1 transition-transform duration-200">
              Read more
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          </div>
          
          {trend.tags && trend.tags.includes('AI-Enhanced') && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                </svg>
                AI Enhanced
              </span>
            </div>
          )}
        </div>
      </Link>
    </div>
  );
}
