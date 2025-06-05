import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ProblemCard from '../../components/ProblemCard';
import { IProblem } from '../../models/Problem';

interface FilterState {
  category: string;
  platform: string;
  urgencyMin: number;
  opportunityMin: number;
  status: string;
  search: string;
}

export default function ProblemsPage() {
  const [problems, setProblems] = useState<IProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<FilterState>({
    category: 'all',
    platform: 'all',
    urgencyMin: 1,
    opportunityMin: 1,
    status: 'all',
    search: ''
  });
  
  useEffect(() => {
    fetchProblems();
  }, [filter]);

  useEffect(() => {
    // Initialize sample data on first load
    initializeSampleData();
  }, []);
  
  const fetchProblems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/problems/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filter)
      });
      
      const data = await response.json();
      if (data.success) {
        setProblems(data.problems || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching problems:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeSampleData = async () => {
    try {
      // Call the collect API to initialize with sample data
      const response = await fetch('/api/monitor/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: ['reddit'],
          keywords: ['api', 'integration', 'automation'],
          categories: ['Technology', 'Business']
        })
      });
      
      if (response.ok) {
        fetchProblems(); // Refresh the list
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };
  
  const startCollection = async () => {
    try {
      setCollecting(true);
      const response = await fetch('/api/monitor/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platforms: ['reddit'],
          keywords: ['api', 'integration', 'automation', 'workflow', 'saas'],
          categories: ['Technology', 'Business']
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Collection complete! Found ${result.total} problems, added ${result.added} new ones.`);
        fetchProblems(); // Refresh the list
      }
    } catch (error) {
      console.error('Error starting collection:', error);
      alert('Error starting collection. Please try again.');
    } finally {
      setCollecting(false);
    }
  };

  const handleStatusChange = async (problemId: string, newStatus: string) => {
    try {
      // For now, just update locally (you could add an API endpoint for this)
      setProblems(prev => prev.map(p => 
        p._id === problemId ? { ...p, status: newStatus as any } : p
      ));
      
      // Show success message
      console.log(`Problem ${problemId} status changed to ${newStatus}`);
    } catch (error) {
      console.error('Error updating problem status:', error);
    }
  };

  const handleFilterChange = (key: keyof FilterState, value: string | number) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilter({
      category: 'all',
      platform: 'all',
      urgencyMin: 1,
      opportunityMin: 1,
      status: 'all',
      search: ''
    });
  };

  const getHighPriorityCount = () => {
    return problems.filter(p => p.urgencyScore >= 7 && p.opportunityScore >= 7).length;
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Problem Monitor</h1>
            <p className="text-gray-600 mt-2">Discover business opportunities from Q&A platforms</p>
          </div>
          <button
            onClick={startCollection}
            disabled={collecting}
            className={`px-6 py-3 rounded-lg font-medium ${
              collecting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700'
            } text-white transition-colors`}
          >
            {collecting ? 'Collecting...' : 'Collect New Problems'}
          </button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Total Problems</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{getHighPriorityCount()}</div>
              <div className="text-gray-600">High Priority</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.avgUrgency?.toFixed(1)}</div>
              <div className="text-gray-600">Avg Urgency</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-2xl font-bold text-purple-600">{stats.avgOpportunity?.toFixed(1)}</div>
              <div className="text-gray-600">Avg Opportunity</div>
            </div>
          </div>
        )}
        
        {/* Filter Controls */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Filters</h2>
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <input
                type="text"
                value={filter.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Search problems..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filter.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Categories</option>
                <option value="Technology">Technology</option>
                <option value="Business">Business</option>
                <option value="Consumer">Consumer</option>
                <option value="Personal">Personal</option>
                <option value="Health">Health</option>
              </select>
            </div>
            
            {/* Platform */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platform</label>
              <select
                value={filter.platform}
                onChange={(e) => handleFilterChange('platform', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Platforms</option>
                <option value="reddit">Reddit</option>
                <option value="stackoverflow">Stack Overflow</option>
                <option value="quora">Quora</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="analyzed">Analyzed</option>
                <option value="actionable">Actionable</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            {/* Urgency Threshold */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Urgency ({filter.urgencyMin})
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={filter.urgencyMin}
                onChange={(e) => handleFilterChange('urgencyMin', parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
        
        {/* Problems Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading problems...</p>
          </div>
        ) : problems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {problems.map((problem) => (
              <ProblemCard 
                key={problem._id} 
                problem={problem} 
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No problems found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your filters or collect new problems from Q&A platforms.
            </p>
            <button
              onClick={startCollection}
              disabled={collecting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium"
            >
              Collect Problems
            </button>
          </div>
        )}

        {/* Load More */}
        {problems.length > 0 && problems.length >= 50 && (
          <div className="text-center mt-8">
            <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg font-medium">
              Load More Problems
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
