import { NextRequest, NextResponse } from 'next/server';
import { trackException, trackEvent } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceApiRoute, addSpanEvent } from '@/lib/tracing';
import { AppError, ValidationError, NotFoundError, handleApiError } from '@/lib/errorHandler';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const searchParams = request.nextUrl.searchParams;
  const errorType = searchParams.get('type') || 'standard';

  return traceApiRoute('GET', '/api/test-error', async (span) => {
    try {
      span.setAttribute('error.type', errorType);
      addSpanEvent('TestErrorTriggered', { type: errorType });
      trackEvent('TestErrorTriggered', { errorType, requestId });
      logger.info({ errorType, requestId }, 'Test error triggered');

      switch (errorType) {
        case 'standard': throw new Error('This is a standard test error for monitoring');
        case 'app': throw new AppError('This is an application error', 500, 'TEST_APP_ERROR', true, { testContext: 'test value' });
        case 'validation': throw new ValidationError('Invalid input provided', { field: 'testField', value: 'invalid' });
        case 'notfound': throw new NotFoundError('TestResource', 'test-123');
        case 'none': return NextResponse.json({ success: true, message: 'No error triggered', requestId, timestamp: new Date().toISOString() });
        default: throw new ValidationError(`Unknown error type: ${errorType}`);
      }
    } catch (error) {
      if (error instanceof Error) trackException(error, { errorType, requestId, endpoint: '/api/test-error' });
      return handleApiError(error, requestId);
    }
  });
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  return traceApiRoute('POST', '/api/test-error', async () => {
    try {
      const body = await request.json();
      if (!body.data) throw new ValidationError('Missing required field: data');
      trackEvent('TestErrorPOST', { requestId, hasData: 'true' });
      return NextResponse.json({ success: true, received: body, requestId });
    } catch (error) { return handleApiError(error, requestId); }
  });
}
