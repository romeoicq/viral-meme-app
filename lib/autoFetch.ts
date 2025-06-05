import { mockDb } from './db/mockDb';
import { eventEmitter, Events } from './eventEmitter';

// Function to fetch and store trends
export const fetchAndStoreTrends = async (): Promise<{
  success: boolean;
  total: number;
  added: number;
  message: string;
}> => {
  try {
    console.log('Auto-fetching latest trends via API route...');
    
    // Use the API route instead of direct XML parsing to avoid CORS issues
    const response = await fetch('/api/fetchTrendHunterFeed');
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch trends');
    }
    
    const data = await response.json();
    
    // If new trends were added, emit the TRENDS_UPDATED event
    if (data.success && data.added > 0) {
      eventEmitter.emit(Events.TRENDS_UPDATED);
    }
    
    return {
      success: data.success,
      total: data.total,
      added: data.added,
      message: data.message
    };
  } catch (error) {
    console.error('Error in auto-fetch operation:', error);
    return {
      success: false,
      total: 0,
      added: 0,
      message: `Error fetching trends: ${error instanceof Error ? error.message : String(error)}`
    };
  }
};

// Last fetch timestamp
let lastFetchTime = 0;

// Minimum interval between fetches (in milliseconds)
// 12 hours = 12 * 60 * 60 * 1000 = 43,200,000 ms
const FETCH_INTERVAL = 12 * 60 * 60 * 1000;

// Function to check if we should fetch now
export const shouldFetchNow = (): boolean => {
  const now = Date.now();
  return now - lastFetchTime >= FETCH_INTERVAL;
};

// Function to perform a fetch if needed and update the last fetch time
export const fetchIfNeeded = async (): Promise<{
  fetched: boolean;
  result?: {
    success: boolean;
    total: number;
    added: number;
    message: string;
  };
}> => {
  if (shouldFetchNow()) {
    const result = await fetchAndStoreTrends();
    lastFetchTime = Date.now();
    return {
      fetched: true,
      result
    };
  }
  
  return {
    fetched: false
  };
};
