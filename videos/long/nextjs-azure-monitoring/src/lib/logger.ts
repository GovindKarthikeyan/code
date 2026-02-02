/**
 * Structured Logging Module using Pino
 */
import pino from 'pino';

const getLogLevel = (): string => process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

const baseConfig: pino.LoggerOptions = {
  level: getLogLevel(),
  base: { env: process.env.NODE_ENV || 'development', version: process.env.APP_VERSION || '1.0.0', service: 'nextjs-azure-monitoring' },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: { paths: ['password', 'secret', 'token', 'authorization', 'cookie', 'apiKey'], censor: '[REDACTED]' },
};

export const logger = process.env.NODE_ENV === 'production'
  ? pino(baseConfig)
  : pino({ ...baseConfig, transport: { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard', ignore: 'pid,hostname' } } });

export function logError(error: Error, context?: Record<string, unknown>): void {
  logger.error({ err: { message: error.message, name: error.name, stack: error.stack }, ...context }, error.message);
}

export function logPerformance(operation: string, durationMs: number, context?: Record<string, unknown>): void {
  const logLevel = durationMs > 1000 ? 'warn' : 'info';
  logger[logLevel]({ operation, durationMs, ...context }, `Operation ${operation} completed in ${durationMs}ms`);
}

export default logger;
