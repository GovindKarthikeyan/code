import { NextRequest, NextResponse } from 'next/server';
import { trackException, trackEvent, trackMetric } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceApiRoute } from '@/lib/tracing';

export const dynamic = 'force-dynamic';

interface ClientTelemetryPayload { type?: string; error?: { message: string; name: string; stack?: string }; metric?: { id: string; name: string; value: number; rating: string; delta: number; navigationType: string }; context?: Record<string, unknown>; url: string; userAgent?: string; timestamp: string }

export async function POST(request: NextRequest) {
  return traceApiRoute('POST', '/api/client-telemetry', async (span) => {
    try {
      const body: ClientTelemetryPayload = await request.json();
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      span.setAttribute('client.url', body.url);
      span.setAttribute('client.ip', clientIp);
      if (body.type === 'web-vital' && body.metric) {
        trackMetric(body.metric.name, body.metric.value, { id: body.metric.id, rating: body.metric.rating, navigationType: body.metric.navigationType, url: body.url });
        trackEvent('WebVital', { name: body.metric.name, value: String(body.metric.value), rating: body.metric.rating, url: body.url });
        logger.debug({ webVital: body.metric, url: body.url }, `Web Vital: ${body.metric.name}`);
      } else if (body.error) {
        const error = new Error(body.error.message);
        error.name = body.error.name;
        error.stack = body.error.stack;
        trackException(error, { source: 'client', url: body.url, userAgent: body.userAgent || 'unknown', clientIp, ...Object.fromEntries(Object.entries(body.context || {}).map(([k, v]) => [k, String(v)])) });
        trackEvent('ClientError', { errorName: error.name, errorMessage: error.message, url: body.url, clientIp });
        logger.warn({ error: body.error, url: body.url, context: body.context, clientIp }, 'Client-side error received');
      }
      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error({ error }, 'Failed to process client telemetry');
      return NextResponse.json({ success: false, error: 'Failed to process telemetry' }, { status: 400 });
    }
  });
}
