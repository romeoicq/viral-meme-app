import { IProblem } from '../models/Problem';

interface ProblemCardProps {
  problem: IProblem;
  onStatusChange?: (problemId: string, newStatus: string) => void;
}

export default function ProblemCard({ problem, onStatusChange }: ProblemCardProps) {
  const getUrgencyColor = (score: number) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  const getOpportunityColor = (score: number) => {
    if (score >= 8) return 'bg-green-500';
    if (score >= 6) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'reddit':
        return '🔴';
      case 'stackoverflow':
        return '📚';
      case 'quora':
        return '🤔';
      default:
        return '💬';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800';
      case 'analyzed':
        return 'bg-yellow-100 text-yellow-800';
      case 'actionable':
        return 'bg-green-100 text-green-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (onStatusChange && problem._id) {
      onStatusChange(problem._id, newStatus);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  const getCombinedScore = () => {
    return problem.urgencyScore + problem.opportunityScore;
  };

  const getCombinedScoreColor = () => {
    const score = getCombinedScore();
    if (score >= 16) return 'text-red-600 font-bold';
    if (score >= 12) return 'text-orange-600 font-semibold';
    if (score >= 8) return 'text-blue-600';
    return 'text-gray-600';
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border-l-4 border-blue-500">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getPlatformIcon(problem.platform)}</span>
          <span className="text-sm bg-gray-100 px-2 py-1 rounded capitalize">
            {problem.platform}
          </span>
          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(problem.status)}`}>
            {problem.status}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getUrgencyColor(problem.urgencyScore)}`} 
                 title={`Urgency: ${problem.urgencyScore}/10`} />
            <span className="text-xs text-gray-500">{problem.urgencyScore}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${getOpportunityColor(problem.opportunityScore)}`}
                 title={`Opportunity: ${problem.opportunityScore}/10`} />
            <span className="text-xs text-gray-500">{problem.opportunityScore}</span>
          </div>
          <div className={`text-sm font-semibold ml-2 ${getCombinedScoreColor()}`}>
            {getCombinedScore()}/20
          </div>
        </div>
      </div>
      
      {/* Title */}
      <h3 className="text-lg font-semibold mb-2 line-clamp-2 text-gray-900">
        {problem.title}
      </h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
        {problem.description}
      </p>

      {/* Author and Engagement */}
      <div className="flex justify-between items-center mb-4 text-xs text-gray-500">
        <div className="flex items-center space-x-4">
          <span>👤 {problem.author.username}</span>
          <span>📅 {formatDate(problem.publishedAt)}</span>
        </div>
        <div className="flex items-center space-x-3">
          {problem.engagementMetrics.upvotes !== undefined && (
            <span>👍 {problem.engagementMetrics.upvotes}</span>
          )}
          {problem.engagementMetrics.comments !== undefined && (
            <span>💬 {problem.engagementMetrics.comments}</span>
          )}
        </div>
      </div>
      
      {/* Tags */}
      <div className="flex flex-wrap gap-1 mb-4">
        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">
          {problem.category}
        </span>
        {problem.tags.slice(0, 3).map((tag, index) => (
          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
            {tag}
          </span>
        ))}
        {problem.tags.length > 3 && (
          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
            +{problem.tags.length - 3}
          </span>
        )}
      </div>

      {/* Business Potential */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center">
          <div className="text-gray-500">Market</div>
          <div className={`font-semibold ${
            problem.businessPotential.marketSize === 'large' ? 'text-green-600' :
            problem.businessPotential.marketSize === 'medium' ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {problem.businessPotential.marketSize}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Competition</div>
          <div className={`font-semibold ${
            problem.businessPotential.competitionLevel === 'low' ? 'text-green-600' :
            problem.businessPotential.competitionLevel === 'medium' ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {problem.businessPotential.competitionLevel}
          </div>
        </div>
        <div className="text-center">
          <div className="text-gray-500">Monetization</div>
          <div className={`font-semibold ${
            problem.businessPotential.monetizationPotential === 'high' ? 'text-green-600' :
            problem.businessPotential.monetizationPotential === 'medium' ? 'text-yellow-600' : 'text-gray-600'
          }`}>
            {problem.businessPotential.monetizationPotential}
          </div>
        </div>
      </div>

      {/* Keyword Matches */}
      {problem.keywordMatches && problem.keywordMatches.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-gray-500 mb-1">Problem Indicators:</div>
          <div className="flex flex-wrap gap-1">
            {problem.keywordMatches.slice(0, 3).map((keyword, index) => (
              <span key={index} className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                "{keyword}"
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <a
            href={problem.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View Original →
          </a>
        </div>
        
        <div className="flex space-x-2">
          {problem.status === 'new' && (
            <button
              onClick={() => handleStatusChange('analyzed')}
              className="text-yellow-600 hover:text-yellow-800 text-sm font-medium"
            >
              Mark Analyzed
            </button>
          )}
          {(problem.status === 'new' || problem.status === 'analyzed') && (
            <button
              onClick={() => handleStatusChange('actionable')}
              className="text-green-600 hover:text-green-800 text-sm font-medium"
            >
              Mark Actionable
            </button>
          )}
          <button
            onClick={() => handleStatusChange('archived')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            Archive
          </button>
        </div>
      </div>
    </div>
  );
}
