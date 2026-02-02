import { NextResponse } from 'next/server';
import { getProcessHealth } from '@/lib/crashHandler';
import { trackAvailability, trackEvent } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceApiRoute } from '@/lib/tracing';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  return traceApiRoute('GET', '/api/health', async (span) => {
    try {
      const health = getProcessHealth();
      const isHealthy = health.memoryUsage.heapUsed < 1024 * 1024 * 1024;
      const response = { status: isHealthy ? 'healthy' : 'unhealthy', timestamp: new Date().toISOString(), uptime: Math.floor(health.uptime), memory: { heapUsed: Math.round(health.memoryUsage.heapUsed / 1024 / 1024), heapTotal: Math.round(health.memoryUsage.heapTotal / 1024 / 1024), rss: Math.round(health.memoryUsage.rss / 1024 / 1024) }, pid: health.pid, version: process.env.APP_VERSION || '1.0.0' };
      const duration = Date.now() - startTime;
      trackAvailability('HealthCheck', duration, isHealthy, isHealthy ? 'OK' : 'Memory threshold exceeded');
      trackEvent('HealthCheckCompleted', { status: response.status, duration: String(duration) });
      span.setAttribute('health.status', response.status);
      span.setAttribute('health.uptime', response.uptime);
      logger.info({ health: response, duration }, 'Health check completed');
      return NextResponse.json(response, { status: isHealthy ? 200 : 503, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } });
    } catch (error) {
      const duration = Date.now() - startTime;
      trackAvailability('HealthCheck', duration, false, error instanceof Error ? error.message : 'Unknown error');
      logger.error({ error }, 'Health check failed');
      return NextResponse.json({ status: 'unhealthy', timestamp: new Date().toISOString(), error: 'Health check failed' }, { status: 503 });
    }
  });
}
