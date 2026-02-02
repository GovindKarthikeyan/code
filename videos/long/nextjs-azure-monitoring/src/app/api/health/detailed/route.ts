import { NextResponse } from 'next/server';
import { getProcessHealth } from '@/lib/crashHandler';
import { trackEvent, getAppInsightsClient } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceApiRoute } from '@/lib/tracing';
import * as os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  return traceApiRoute('GET', '/api/health/detailed', async (span) => {
    try {
      const health = getProcessHealth();
      const appInsightsClient = getAppInsightsClient();
      const systemInfo = { hostname: os.hostname(), platform: os.platform(), arch: os.arch(), cpus: os.cpus().length, totalMemory: Math.round(os.totalmem() / 1024 / 1024), freeMemory: Math.round(os.freemem() / 1024 / 1024), loadAverage: os.loadavg(), osUptime: Math.floor(os.uptime()) };
      const processInfo = { pid: health.pid, ppid: process.ppid, title: process.title, platform: health.platform, nodeVersion: health.nodeVersion, uptime: Math.floor(health.uptime), cwd: process.cwd(), execPath: process.execPath };
      const memoryInfo = { heapUsed: Math.round(health.memoryUsage.heapUsed / 1024 / 1024), heapTotal: Math.round(health.memoryUsage.heapTotal / 1024 / 1024), external: Math.round(health.memoryUsage.external / 1024 / 1024), arrayBuffers: Math.round(health.memoryUsage.arrayBuffers / 1024 / 1024), rss: Math.round(health.memoryUsage.rss / 1024 / 1024) };
      const cpuUsage = { user: Math.round(health.cpuUsage.user / 1000), system: Math.round(health.cpuUsage.system / 1000) };
      const environmentInfo = { nodeEnv: process.env.NODE_ENV || 'development', appVersion: process.env.APP_VERSION || '1.0.0', azureSiteName: process.env.WEBSITE_SITE_NAME || 'local', azureInstanceId: process.env.WEBSITE_INSTANCE_ID || 'local', appInsightsConfigured: !!appInsightsClient };
      const heapUsedMB = memoryInfo.heapUsed;
      const memoryThreshold = 1024;
      const isHealthy = heapUsedMB < memoryThreshold;
      const response = { status: isHealthy ? 'healthy' : 'degraded', timestamp: new Date().toISOString(), checks: { memory: { status: heapUsedMB < memoryThreshold ? 'pass' : 'warn', heapUsedMB, thresholdMB: memoryThreshold }, process: { status: 'pass', uptime: processInfo.uptime }, monitoring: { status: appInsightsClient ? 'pass' : 'warn', appInsightsConfigured: !!appInsightsClient } }, system: systemInfo, process: processInfo, memory: memoryInfo, cpu: cpuUsage, environment: environmentInfo, responseTime: Date.now() - startTime };
      span.setAttribute('health.status', response.status);
      span.setAttribute('health.memory.heapUsedMB', heapUsedMB);
      span.setAttribute('health.monitoring.configured', !!appInsightsClient);
      trackEvent('DetailedHealthCheck', { status: response.status, heapUsedMB: String(heapUsedMB), uptime: String(processInfo.uptime) });
      logger.info({ healthDetails: response }, 'Detailed health check completed');
      return NextResponse.json(response, { status: isHealthy ? 200 : 503, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    } catch (error) {
      logger.error({ error }, 'Detailed health check failed');
      return NextResponse.json({ status: 'unhealthy', timestamp: new Date().toISOString(), error: error instanceof Error ? error.message : 'Unknown error' }, { status: 503 });
    }
  });
}
