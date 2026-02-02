import { NextRequest, NextResponse } from 'next/server';
import { trackException, trackEvent, flushTelemetry } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceApiRoute } from '@/lib/tracing';
import { spawn } from 'child_process';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const crashType = searchParams.get('type') || 'info';
  const requestId = crypto.randomUUID();

  return traceApiRoute('GET', '/api/crash-test', async (span) => {
    span.setAttribute('crash.type', crashType);
    logger.info({ crashType, requestId }, 'Crash test endpoint called');

    switch (crashType) {
      case 'info':
        return NextResponse.json({ message: 'Crash test endpoint - Available tests', tests: { 'unhandledRejection': 'Triggers an unhandled promise rejection', 'childProcessCrash': 'Spawns a child process that crashes', 'memoryLeak': 'Simulates memory leak', 'cpuSpike': 'Causes a CPU spike' }, warning: 'Some tests will crash the server. Use with caution!', usage: '?type=<test_type>', requestId });

      case 'unhandledRejection':
        trackEvent('CrashTest', { type: 'unhandledRejection', requestId });
        Promise.reject(new Error('Test unhandled promise rejection'));
        return NextResponse.json({ message: 'Unhandled rejection triggered', note: 'Check logs for the unhandled rejection', requestId });

      case 'childProcessCrash':
        trackEvent('CrashTest', { type: 'childProcessCrash', requestId });
        return new Promise<NextResponse>((resolve) => {
          const child = spawn('node', ['-e', `console.log('Child process started'); console.log('PID:', process.pid); setTimeout(() => { console.log('Child process crashing...'); throw new Error('Child process crash test'); }, 100);`], { stdio: ['pipe', 'pipe', 'pipe'] });
          let stdout = '', stderr = '';
          child.stdout?.on('data', (data) => { stdout += data.toString(); });
          child.stderr?.on('data', (data) => { stderr += data.toString(); });
          child.on('exit', (code, signal) => {
            logger.info({ childPid: child.pid, exitCode: code, signal, stdout, stderr }, 'Child process exited');
            trackEvent('ChildProcessCrash', { pid: String(child.pid), exitCode: String(code), signal: signal || 'none', requestId });
            if (code !== 0) trackException(new Error(`Child process crashed with code ${code}`), { type: 'childProcessCrash', pid: String(child.pid), exitCode: String(code), stderr: stderr.substring(0, 500) });
            resolve(NextResponse.json({ message: 'Child process crash test completed', childPid: child.pid, exitCode: code, signal, stdout: stdout.trim(), stderr: stderr.trim(), requestId }));
          });
          setTimeout(() => { child.kill(); resolve(NextResponse.json({ message: 'Child process test timed out', requestId })); }, 5000);
        });

      case 'memoryLeak':
        trackEvent('CrashTest', { type: 'memoryLeak', requestId });
        const leakArrays: number[][] = [];
        for (let i = 0; i < 10; i++) leakArrays.push(new Array(100000).fill(Math.random()));
        return NextResponse.json({ message: 'Memory leak simulation (controlled)', iterations: 10, memoryUsage: { heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB' }, requestId });

      case 'cpuSpike':
        trackEvent('CrashTest', { type: 'cpuSpike', requestId });
        const startTime = Date.now();
        let count = 0;
        while (Date.now() - startTime < 1000) { Math.sqrt(Math.random() * 1000000); count++; }
        return NextResponse.json({ message: 'CPU spike test completed', iterations: count, duration: Date.now() - startTime + 'ms', requestId });

      default:
        return NextResponse.json({ error: 'Unknown crash type', availableTypes: ['info', 'unhandledRejection', 'childProcessCrash', 'memoryLeak', 'cpuSpike'], requestId }, { status: 400 });
    }
  });
}
