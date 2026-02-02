/**
 * Application Insights Module - Updated for SDK v3.x
 */
import { logger } from './logger';

let appInsights: typeof import('applicationinsights') | null = null;
let isInitialized = false;
let client: import('applicationinsights').TelemetryClient | null = null;

interface AppInsightsConfig {
  connectionString?: string;
  cloudRoleName?: string;
  cloudRoleInstance?: string;
  samplingPercentage?: number;
}

async function loadAppInsights(): Promise<typeof import('applicationinsights') | null> {
  if (appInsights) return appInsights;
  try {
    if (typeof window !== 'undefined') return null;
    appInsights = await import('applicationinsights');
    return appInsights;
  } catch (error) {
    logger.warn({ error }, 'Failed to load Application Insights module');
    return null;
  }
}

export async function initializeAppInsights(config?: AppInsightsConfig): Promise<import('applicationinsights').TelemetryClient | null> {
  if (isInitialized && client) return client;
  const connectionString = config?.connectionString || process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  if (!connectionString) {
    logger.warn('Application Insights not configured. Set APPLICATIONINSIGHTS_CONNECTION_STRING environment variable.');
    return null;
  }
  try {
    const ai = await loadAppInsights();
    if (!ai) return null;
    ai.setup(connectionString).start();
    client = ai.defaultClient;
    if (client) {
      client.context.tags[client.context.keys.cloudRole] = config?.cloudRoleName || process.env.WEBSITE_SITE_NAME || 'nextjs-azure-app';
      client.context.tags[client.context.keys.cloudRoleInstance] = config?.cloudRoleInstance || process.env.WEBSITE_INSTANCE_ID || process.env.HOSTNAME || 'default-instance';
      if (config?.samplingPercentage !== undefined) client.config.samplingPercentage = config.samplingPercentage;
      client.addTelemetryProcessor((envelope) => {
        envelope.tags = envelope.tags || {};
        envelope.data = envelope.data || {};
        if (envelope.data.baseData) {
          envelope.data.baseData.properties = envelope.data.baseData.properties || {};
          envelope.data.baseData.properties['app.version'] = process.env.APP_VERSION || '1.0.0';
          envelope.data.baseData.properties['node.version'] = process.version;
          envelope.data.baseData.properties['environment'] = process.env.NODE_ENV || 'development';
        }
        return true;
      });
      isInitialized = true;
      logger.info('Application Insights initialized successfully');
    }
    return client;
  } catch (error) {
    logger.error({ error }, 'Failed to initialize Application Insights');
    return null;
  }
}

export function getAppInsightsClient(): import('applicationinsights').TelemetryClient | null { return client; }

export function trackException(error: Error, properties?: Record<string, string>): void {
  if (client) client.trackException({ exception: error, properties: { ...properties, timestamp: new Date().toISOString() } });
  logger.error({ error: error.message, stack: error.stack, ...properties }, 'Exception tracked');
}

export function trackEvent(name: string, properties?: Record<string, string>, measurements?: Record<string, number>): void {
  if (client) client.trackEvent({ name, properties: { ...properties, timestamp: new Date().toISOString() }, measurements });
  logger.info({ name, properties, measurements }, 'Event tracked');
}

export function trackMetric(name: string, value: number, properties?: Record<string, string>): void {
  if (client) client.trackMetric({ name, value, properties: { ...properties, timestamp: new Date().toISOString() } });
  logger.debug({ name, value, properties }, 'Metric tracked');
}

export function trackDependency(name: string, commandName: string, duration: number, success: boolean, dependencyTypeName: string, target?: string, properties?: Record<string, string>): void {
  if (client) client.trackDependency({ name, dependencyTypeName, target: target || 'external', data: commandName, duration, resultCode: success ? 200 : 500, success, properties: { ...properties, timestamp: new Date().toISOString() } });
}

export function trackTrace(message: string, severity: 'Verbose' | 'Information' | 'Warning' | 'Error' | 'Critical' = 'Information', properties?: Record<string, string>): void {
  if (client) client.trackTrace({ message, severity, properties: { ...properties, timestamp: new Date().toISOString() } });
}

export function trackRequest(name: string, url: string, duration: number, resultCode: number, success: boolean, properties?: Record<string, string>): void {
  if (client) client.trackRequest({ name, url, duration, resultCode: String(resultCode), success, properties: { ...properties, timestamp: new Date().toISOString() } });
}

export async function flushTelemetry(): Promise<void> {
  if (client) { await client.flush(); logger.info('Telemetry flushed successfully'); }
}

export function trackAvailability(name: string, duration: number, success: boolean, message?: string, properties?: Record<string, string>): void {
  if (client) {
    client.trackAvailability({
      id: crypto.randomUUID(),
      name,
      duration,
      success,
      runLocation: process.env.WEBSITE_SITE_NAME || 'local',
      message: message || (success ? 'Health check passed' : 'Health check failed'),
      properties: { ...properties, timestamp: new Date().toISOString() }
    });
  }
}
