/**
 * Process Crash Handler Module
 */
import { logger } from './logger';
import { trackException, trackEvent, flushTelemetry } from './appInsights';

let isShuttingDown = false;

export function setupProcessCrashHandlers(): void {
  process.on('uncaughtException', async (error: Error, origin: string) => {
    logger.fatal({ err: { message: error.message, name: error.name, stack: error.stack }, origin, processId: process.pid }, 'Uncaught Exception detected');
    trackException(error, { type: 'uncaughtException', origin, processId: String(process.pid) });
    trackEvent('ProcessCrash', { crashType: 'uncaughtException', errorMessage: error.message, processId: String(process.pid) });
    await handleGracefulShutdown('uncaughtException');
    process.exit(1);
  });

  process.on('unhandledRejection', async (reason: unknown) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error({ err: { message: error.message, name: error.name, stack: error.stack }, processId: process.pid }, 'Unhandled Promise Rejection detected');
    trackException(error, { type: 'unhandledRejection', processId: String(process.pid) });
    trackEvent('UnhandledRejection', { errorMessage: error.message, processId: String(process.pid) });
  });

  process.on('warning', (warning: Error) => {
    logger.warn({ warning: { message: warning.message, name: warning.name, stack: warning.stack }, processId: process.pid }, 'Process warning detected');
    trackEvent('ProcessWarning', { warningMessage: warning.message, processId: String(process.pid) });
  });

  process.on('SIGTERM', async () => { logger.info({ signal: 'SIGTERM', processId: process.pid }, 'SIGTERM signal received'); trackEvent('ProcessSignal', { signal: 'SIGTERM', processId: String(process.pid) }); await handleGracefulShutdown('SIGTERM'); process.exit(0); });
  process.on('SIGINT', async () => { logger.info({ signal: 'SIGINT', processId: process.pid }, 'SIGINT signal received'); trackEvent('ProcessSignal', { signal: 'SIGINT', processId: String(process.pid) }); await handleGracefulShutdown('SIGINT'); process.exit(0); });

  logger.info({ processId: process.pid }, 'Process crash handlers initialized');
}

async function handleGracefulShutdown(reason: string): Promise<void> {
  if (isShuttingDown) { logger.warn('Shutdown already in progress'); return; }
  isShuttingDown = true;
  logger.info({ reason, processId: process.pid }, 'Starting graceful shutdown');
  try { await flushTelemetry(); logger.info('Telemetry flushed successfully during shutdown'); } catch (error) { logger.error({ error }, 'Error flushing telemetry during shutdown'); }
  await new Promise(resolve => setTimeout(resolve, 1000));
}

export function startMemoryMonitoring(intervalMs: number = 30000): NodeJS.Timeout {
  return setInterval(() => {
    const memoryUsage = process.memoryUsage();
    const memoryMB = { rss: Math.round(memoryUsage.rss / 1024 / 1024), heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), external: Math.round(memoryUsage.external / 1024 / 1024) };
    logger.debug({ memory: memoryMB, processId: process.pid }, 'Memory usage');
    if (memoryMB.heapUsed > 1024) { logger.warn({ memory: memoryMB, processId: process.pid }, 'High memory usage detected'); trackEvent('HighMemoryUsage', { heapUsedMB: String(memoryMB.heapUsed), processId: String(process.pid) }); }
  }, intervalMs);
}

export function getProcessHealth(): { uptime: number; memoryUsage: NodeJS.MemoryUsage; cpuUsage: NodeJS.CpuUsage; pid: number; platform: NodeJS.Platform; nodeVersion: string } {
  return { uptime: process.uptime(), memoryUsage: process.memoryUsage(), cpuUsage: process.cpuUsage(), pid: process.pid, platform: process.platform, nodeVersion: process.version };
}

export { isShuttingDown };
