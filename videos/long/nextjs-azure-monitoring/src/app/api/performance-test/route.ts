import { NextRequest, NextResponse } from 'next/server';
import { trackMetric, trackEvent, trackDependency } from '@/lib/appInsights';
import { logger, logPerformance } from '@/lib/logger';
import { traceApiRoute, withSpan, addSpanEvent } from '@/lib/tracing';
import { SpanKind } from '@opentelemetry/api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const testType = searchParams.get('type') || 'all';
  const requestId = crypto.randomUUID();

  return traceApiRoute('GET', '/api/performance-test', async (span) => {
    span.setAttribute('test.type', testType);
    const results: Record<string, unknown> = { requestId, timestamp: new Date().toISOString(), tests: {} };
    logger.info({ testType, requestId }, 'Performance test started');

    if (testType === 'all' || testType === 'cpu') {
      const cpuResult = await withSpan('cpu-intensive-operation', async (cpuSpan) => {
        const start = Date.now();
        let result = 0;
        for (let i = 0; i < 1000000; i++) result += Math.sqrt(i) * Math.sin(i);
        const duration = Date.now() - start;
        cpuSpan.setAttribute('iterations', 1000000);
        cpuSpan.setAttribute('duration.ms', duration);
        trackMetric('CPUOperationDuration', duration, { operation: 'sqrt-sin' });
        logPerformance('cpu-intensive-operation', duration, { iterations: 1000000 });
        return { duration, result: Math.round(result) };
      }, { kind: SpanKind.INTERNAL, attributes: { 'operation.type': 'cpu' } });
      results.tests = { ...(results.tests as object), cpu: cpuResult };
    }

    if (testType === 'all' || testType === 'memory') {
      const memoryResult = await withSpan('memory-allocation-test', async (memSpan) => {
        const start = Date.now();
        const memBefore = process.memoryUsage().heapUsed;
        const arrays: number[][] = [];
        for (let i = 0; i < 100; i++) arrays.push(new Array(10000).fill(Math.random()));
        const memAfter = process.memoryUsage().heapUsed;
        const duration = Date.now() - start;
        const memoryUsed = memAfter - memBefore;
        memSpan.setAttribute('memory.allocated.bytes', memoryUsed);
        memSpan.setAttribute('duration.ms', duration);
        trackMetric('MemoryAllocationDuration', duration);
        trackMetric('MemoryAllocated', memoryUsed / 1024 / 1024, { unit: 'MB' });
        logPerformance('memory-allocation-test', duration, { memoryMB: memoryUsed / 1024 / 1024 });
        arrays.length = 0;
        return { duration, memoryAllocated: `${Math.round(memoryUsed / 1024)} KB` };
      }, { kind: SpanKind.INTERNAL, attributes: { 'operation.type': 'memory' } });
      results.tests = { ...(results.tests as object), memory: memoryResult };
    }

    if (testType === 'all' || testType === 'async') {
      const asyncResult = await withSpan('async-operations-test', async (asyncSpan) => {
        const start = Date.now();
        const delays = [50, 100, 150];
        addSpanEvent('Starting parallel operations');
        await Promise.all(delays.map((delay, index) => withSpan(`async-task-${index}`, async (taskSpan) => { await new Promise(resolve => setTimeout(resolve, delay)); taskSpan.setAttribute('delay.ms', delay); return delay; })));
        addSpanEvent('Parallel operations completed');
        const duration = Date.now() - start;
        asyncSpan.setAttribute('duration.ms', duration);
        asyncSpan.setAttribute('task.count', delays.length);
        trackMetric('AsyncOperationsDuration', duration, { taskCount: String(delays.length) });
        logPerformance('async-operations-test', duration, { tasks: delays.length });
        return { duration, tasks: delays.length, expectedMinDuration: Math.max(...delays) };
      }, { kind: SpanKind.INTERNAL, attributes: { 'operation.type': 'async' } });
      results.tests = { ...(results.tests as object), async: asyncResult };
    }

    if (testType === 'all' || testType === 'dependency') {
      const dependencyResult = await withSpan('simulated-dependency-call', async (depSpan) => {
        const start = Date.now();
        await new Promise(resolve => setTimeout(resolve, 200));
        const duration = Date.now() - start;
        const success = Math.random() > 0.1;
        depSpan.setAttribute('dependency.success', success);
        depSpan.setAttribute('duration.ms', duration);
        trackDependency('ExternalAPI', 'GET /api/external', duration, success, 'HTTP', 'api.external.com', { simulation: 'true' });
        logPerformance('simulated-dependency-call', duration, { success });
        return { duration, success, target: 'api.external.com' };
      }, { kind: SpanKind.CLIENT, attributes: { 'operation.type': 'dependency' } });
      results.tests = { ...(results.tests as object), dependency: dependencyResult };
    }

    const totalTests = Object.keys(results.tests as object).length;
    trackEvent('PerformanceTestCompleted', { testType, testsRun: String(totalTests), requestId });
    logger.info({ testType, testsRun: totalTests, results: results.tests, requestId }, 'Performance test completed');
    return NextResponse.json({ success: true, testType, testsRun: totalTests, ...results });
  });
}
