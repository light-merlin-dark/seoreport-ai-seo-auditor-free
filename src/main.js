import { Actor } from 'apify';

const API_BASE = process.env.SEOREPORT_API_BASE_URL || 'https://api.seoreport.dev';
const ACTOR_TOKEN = process.env.SEOREPORT_ACTOR_TOKEN;

const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_TIME_MS = 90_000;

async function submitReport(url) {
  const res = await fetch(`${API_BASE}/api/v1/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-SEOReport-Actor-Token': ACTOR_TOKEN,
    },
    body: JSON.stringify({ url }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok || !data.success) {
    const error = data.error || `API error ${res.status}`;
    throw new Error(`SEOReport submit failed: ${error}`);
  }

  return data;
}

async function pollReport(jobId) {
  const start = Date.now();

  while (Date.now() - start < MAX_POLL_TIME_MS) {
    const res = await fetch(`${API_BASE}/api/v1/reports/${jobId}/result`, {
      headers: {
        'X-SEOReport-Actor-Token': ACTOR_TOKEN,
      },
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.success) {
      const error = data.error || `API error ${res.status}`;
      throw new Error(`SEOReport poll failed: ${error}`);
    }

    const report = data.report;
    if (report?.isSnapshotReady || report?.status === 'completed') {
      return report;
    }

    if (report?.status === 'failed' || report?.status === 'dead_lettered' || report?.status === 'cancelled') {
      throw new Error(`Report failed with status: ${report.status}`);
    }

    const pollAfter = data.pollAfterMs || POLL_INTERVAL_MS;
    await new Promise(r => setTimeout(r, pollAfter));
  }

  throw new Error(`Report did not complete within ${MAX_POLL_TIME_MS / 1000}s. The job may still be processing.`);
}

await Actor.init();

const input = await Actor.getInput();
const rawUrl = typeof input?.url === 'string' ? input.url.trim() : '';

if (!rawUrl) {
  console.error('❌ Input "url" is required');
  await Actor.exit(1);
}

if (!ACTOR_TOKEN) {
  console.error('❌ Environment variable SEOREPORT_ACTOR_TOKEN is not configured');
  await Actor.exit(1);
}

const url = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;

try {
  new URL(url);
} catch {
  console.error(`❌ Invalid URL: ${rawUrl}`);
  await Actor.exit(1);
}

console.log(`🔍 Starting SEO audit for: ${url}`);

const submitData = await submitReport(url);
const jobId = submitData.report?.jobId;

if (!jobId) {
  console.error('❌ API response missing jobId');
  await Actor.exit(1);
}

console.log(`⏳ Report queued (jobId: ${jobId}). Polling for results...`);

const report = await pollReport(jobId);

console.log(`✅ Report complete — Score: ${report.score?.overall ?? '?'}/100`);
console.log(`💡 Upgrade to advanced report: https://seoreport.dev/pricing`);

// Push to Apify Dataset (for automation / CSV export)
await Actor.pushData(report);

// Push to OUTPUT key-value store (for direct API access)
await Actor.setValue('OUTPUT', report);

await Actor.exit();
