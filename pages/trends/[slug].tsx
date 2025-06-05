import { GetServerSideProps } from 'next';
import { useState } from 'react';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { ITrend } from '../../models/Trend';
import dbConnect from '../../lib/db/dbConnect';
import EnhanceTrendButton from '../../components/EnhanceTrendButton';

interface TrendDetailProps {
  trend: ITrend;
  relatedTrends: ITrend[];
}

export default function TrendDetail({ trend: initialTrend, relatedTrends }: TrendDetailProps) {
  const [trend, setTrend] = useState(initialTrend);
  
  // Handle successful enhancement
  const handleEnhancementSuccess = (enhancedTrend: ITrend) => {
    setTrend(enhancedTrend);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/" className="text-blue-600 hover:text-blue-800 inline-flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Trends
          </Link>
        </div>
        
        <div className="mb-6">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-2">
            {trend.category}
          </span>
          
          {trend.tags && trend.tags.includes('AI-Enhanced') && (
            <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full mb-2 ml-2">
              AI-Enhanced
            </span>
          )}
          
          <h1 className="text-4xl font-bold mb-2">{trend.title}</h1>
          <p className="text-gray-600 mb-4">
            Published on {new Date(trend.publishedAt).toLocaleDateString()} 
            by <span className="font-medium">{trend.source}</span>
          </p>
          
          <div className="flex space-x-2 mb-4">
            {trend.tags && trend.tags.map(tag => (
              <span key={tag} className="bg-gray-200 text-gray-800 text-sm px-2 py-1 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
        
        <EnhanceTrendButton trend={trend} onSuccess={handleEnhancementSuccess} />
        
        <div className="mb-8">
          <div className="aspect-w-16 aspect-h-9 mb-6">
            <img 
              src={trend.imageUrl} 
              alt={trend.title} 
              className="object-cover rounded-lg shadow-md w-full h-64"
            />
          </div>
          
          <div className="prose prose-blue max-w-none" dangerouslySetInnerHTML={{ __html: trend.content }} />
        </div>
        
        {trend.sourceUrl && (
          <div className="mb-8 p-4 bg-gray-100 rounded-lg">
            <p className="font-medium">Original Source:</p>
            <a 
              href={trend.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              {trend.sourceUrl}
            </a>
          </div>
        )}
        
        {relatedTrends.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Related Trends</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedTrends.map(relatedTrend => (
                <Link 
                  href={`/trends/${relatedTrend.slug}`} 
                  key={relatedTrend._id}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-blue-50"
                >
                  <h3 className="font-bold text-lg mb-2">{relatedTrend.title}</h3>
                  <p className="text-gray-600 text-sm">{relatedTrend.summary.substring(0, 120)}...</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const db = await dbConnect();
  
  // Get the trend by slug
  const slug = params?.slug as string;
  const trend = await db.findOne({ slug });
  
  if (!trend) {
    return {
      notFound: true,
    };
  }
  
  // Get related trends by category or tags, excluding the current one
  const relatedTrends = await db.find({
    $or: [
      { category: trend.category },
      { tags: { $in: trend.tags } }
    ],
    _id: { $ne: trend._id }
  })
  .sort({ publishedAt: -1 })
  .limit(4)
  .exec();
  
  return {
    props: {
      trend: JSON.parse(JSON.stringify(trend)),
      relatedTrends: JSON.parse(JSON.stringify(relatedTrends)),
    },
  };
};
