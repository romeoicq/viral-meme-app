import type { NextApiRequest, NextApiResponse } from 'next';

// Simple in-memory scheduler (in production, use a proper job scheduler like node-cron)
let schedulerState = {
  isRunning: false,
  lastRun: null as Date | null,
  nextRun: null as Date | null,
  interval: 24 * 60 * 60 * 1000, // 24 hours
  enabled: true
};

let schedulerTimer: NodeJS.Timeout | null = null;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return handleGetStatus(req, res);
  } else if (req.method === 'POST') {
    return handleControl(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleGetStatus(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    scheduler: {
      ...schedulerState,
      intervalHours: schedulerState.interval / (60 * 60 * 1000)
    }
  });
}

async function handleControl(req: NextApiRequest, res: NextApiResponse) {
  const { action, intervalHours } = req.body;

  try {
    switch (action) {
      case 'start':
        startScheduler();
        break;
      case 'stop':
        stopScheduler();
        break;
      case 'trigger':
        await triggerManualRun();
        break;
      case 'setInterval':
        if (intervalHours && intervalHours > 0) {
          setSchedulerInterval(intervalHours);
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({
      success: true,
      scheduler: {
        ...schedulerState,
        intervalHours: schedulerState.interval / (60 * 60 * 1000)
      }
    });
  } catch (error) {
    console.error('Scheduler control error:', error);
    res.status(500).json({ 
      error: 'Scheduler operation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function startScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
  }

  schedulerState.enabled = true;
  schedulerState.nextRun = new Date(Date.now() + schedulerState.interval);

  schedulerTimer = setInterval(async () => {
    await runScheduledUpdate();
  }, schedulerState.interval);

  console.log('📅 Meme scheduler started');
}

function stopScheduler() {
  if (schedulerTimer) {
    clearInterval(schedulerTimer);
    schedulerTimer = null;
  }

  schedulerState.enabled = false;
  schedulerState.nextRun = null;

  console.log('⏹️ Meme scheduler stopped');
}

async function triggerManualRun() {
  console.log('🚀 Manual meme update triggered');
  await runScheduledUpdate();
}

function setSchedulerInterval(hours: number) {
  const newInterval = hours * 60 * 60 * 1000;
  schedulerState.interval = newInterval;

  if (schedulerState.enabled) {
    // Restart with new interval
    startScheduler();
  }

  console.log(`⏰ Scheduler interval updated to ${hours} hours`);
}

async function runScheduledUpdate() {
  if (schedulerState.isRunning) {
    console.log('⚠️ Scheduler already running, skipping...');
    return;
  }

  schedulerState.isRunning = true;
  schedulerState.lastRun = new Date();
  schedulerState.nextRun = new Date(Date.now() + schedulerState.interval);

  try {
    console.log('🔄 Running scheduled meme update...');
    
    // Call the aggregation API to refresh memes
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/memes/aggregate?refresh=true`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Scheduled update completed: ${data.memes?.length || 0} memes processed`);
    } else {
      throw new Error(`Aggregation API returned ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Scheduled update failed:', error);
  } finally {
    schedulerState.isRunning = false;
  }
}

// Auto-start scheduler on server startup
if (typeof window === 'undefined' && schedulerState.enabled) {
  // Delay startup by 30 seconds to let server fully initialize
  setTimeout(() => {
    startScheduler();
    console.log('🚀 Auto-started meme scheduler on server startup');
  }, 30000);
}
