import React, { useState, useEffect } from 'react';
import Head from 'next/head';

interface MemeSource {
  id: string;
  name: string;
  url: string;
  type: 'rss' | 'reddit' | 'api';
  enabled: boolean;
  lastFetch?: Date;
}

interface SchedulerStatus {
  isRunning: boolean;
  lastRun: Date | null;
  nextRun: Date | null;
  intervalHours: number;
  enabled: boolean;
}

export default function MemeAdminPage() {
  const [sources, setSources] = useState<MemeSource[]>([]);
  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAggregation, setLastAggregation] = useState<any>(null);

  // Load initial data
  useEffect(() => {
    loadSchedulerStatus();
    loadLastAggregation();
  }, []);

  const loadSchedulerStatus = async () => {
    try {
      const response = await fetch('/api/memes/scheduler');
      if (response.ok) {
        const data = await response.json();
        setScheduler(data.scheduler);
      }
    } catch (error) {
      console.error('Failed to load scheduler status:', error);
    }
  };

  const loadLastAggregation = async () => {
    try {
      const response = await fetch('/api/memes/aggregate');
      if (response.ok) {
        const data = await response.json();
        setLastAggregation(data);
        setSources(data.sources || []);
      }
    } catch (error) {
      console.error('Failed to load aggregation data:', error);
    }
  };

  const controlScheduler = async (action: string, intervalHours?: number) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/memes/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, intervalHours })
      });

      if (response.ok) {
        const data = await response.json();
        setScheduler(data.scheduler);
      }
    } catch (error) {
      console.error('Scheduler control failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualUpdate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/memes/aggregate?refresh=true');
      if (response.ok) {
        const data = await response.json();
        setLastAggregation(data);
        alert(`Updated! Fetched ${data.memes?.length || 0} memes from ${data.totalFetched || 0} sources.`);
      }
    } catch (error) {
      console.error('Manual update failed:', error);
      alert('Update failed: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSource = async (sourceId: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/memes/aggregate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateSource',
          sourceId,
          updates: { enabled }
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Failed to update source:', error);
    }
  };

  return (
    <>
      <Head>
        <title>Meme Aggregator Admin</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">🔧 Meme Aggregator Admin</h1>
            <p className="text-gray-300">Manage RSS feeds, scheduling, and daily meme updates</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">🚀 Quick Actions</h2>
            <div className="flex gap-4 flex-wrap">
              <button
                onClick={triggerManualUpdate}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
              >
                {isLoading ? '⏳ Updating...' : '🔄 Fetch New Memes Now'}
              </button>
              <button
                onClick={() => window.open('/memes?source=aggregate', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                👀 View Aggregated Memes
              </button>
              <button
                onClick={() => window.open('/memes', '_blank')}
                className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                🎭 View Original Memes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Scheduler Control */}
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">📅 Scheduler Status</h2>
              
              {scheduler && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Status:</span>
                      <div className={`font-semibold ${scheduler.enabled ? 'text-green-400' : 'text-red-400'}`}>
                        {scheduler.enabled ? '✅ Running' : '❌ Stopped'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Interval:</span>
                      <div className="font-semibold">{scheduler.intervalHours}h</div>
                    </div>
                    <div>
                      <span className="text-gray-300">Last Run:</span>
                      <div className="font-semibold">
                        {scheduler.lastRun ? new Date(scheduler.lastRun).toLocaleString() : 'Never'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Next Run:</span>
                      <div className="font-semibold">
                        {scheduler.nextRun ? new Date(scheduler.nextRun).toLocaleString() : 'Not scheduled'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => controlScheduler(scheduler.enabled ? 'stop' : 'start')}
                      disabled={isLoading}
                      className={`px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors ${
                        scheduler.enabled 
                          ? 'bg-red-600 hover:bg-red-700' 
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {scheduler.enabled ? '⏹️ Stop' : '▶️ Start'}
                    </button>
                    <button
                      onClick={() => controlScheduler('trigger')}
                      disabled={isLoading}
                      className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                    >
                      ⚡ Trigger Now
                    </button>
                    <select
                      onChange={(e) => controlScheduler('setInterval', Number(e.target.value))}
                      value={scheduler.intervalHours}
                      className="bg-gray-800 text-white px-3 py-2 rounded-lg"
                    >
                      <option value={1}>1 hour</option>
                      <option value={6}>6 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                      <option value={48}>48 hours</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Last Aggregation Stats */}
            <div className="bg-white bg-opacity-10 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-4">📊 Last Update Stats</h2>
              
              {lastAggregation && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Total Memes:</span>
                      <div className="font-semibold text-2xl text-green-400">
                        {lastAggregation.memes?.length || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Sources Fetched:</span>
                      <div className="font-semibold text-2xl text-blue-400">
                        {lastAggregation.totalFetched || 0}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Last Updated:</span>
                      <div className="font-semibold">
                        {lastAggregation.lastUpdated 
                          ? new Date(lastAggregation.lastUpdated).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-300">Cached:</span>
                      <div className={`font-semibold ${lastAggregation.cached ? 'text-yellow-400' : 'text-green-400'}`}>
                        {lastAggregation.cached ? '📁 Yes' : '🔄 Fresh'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Meme Sources */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">📡 Meme Sources</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    source.enabled 
                      ? 'border-green-400 bg-green-400 bg-opacity-10' 
                      : 'border-gray-600 bg-gray-600 bg-opacity-10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{source.name}</h3>
                    <button
                      onClick={() => toggleSource(source.id, !source.enabled)}
                      className={`px-3 py-1 rounded-full text-sm font-semibold transition-colors ${
                        source.enabled
                          ? 'bg-green-600 hover:bg-green-700 text-white'
                          : 'bg-gray-600 hover:bg-gray-700 text-white'
                      }`}
                    >
                      {source.enabled ? '✅ On' : '❌ Off'}
                    </button>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-300">Type:</span>
                      <span className="ml-2 font-mono bg-gray-800 px-2 py-1 rounded">
                        {source.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-300">URL:</span>
                      <div className="text-xs font-mono text-gray-400 break-all mt-1">
                        {source.url}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white bg-opacity-10 rounded-xl p-6 mt-8">
            <h2 className="text-2xl font-bold mb-4">📋 How It Works</h2>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">🔄 Automatic Updates:</strong> The scheduler fetches fresh memes from Reddit RSS feeds and Imgflip API daily.
              </div>
              <div>
                <strong className="text-white">📡 Multiple Sources:</strong> Aggregates from r/memes, r/dankmemes, r/funny, r/wholesomememes, and Imgflip.
              </div>
              <div>
                <strong className="text-white">🎯 Smart Filtering:</strong> Automatically categorizes memes as Viral or Fresh based on engagement metrics.
              </div>
              <div>
                <strong className="text-white">💾 Efficient Caching:</strong> 24-hour cache prevents excessive API calls while keeping content fresh.
              </div>
              <div>
                <strong className="text-white">🔧 Easy Management:</strong> Enable/disable sources and control update frequency from this admin panel.
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
