/**
 * Next.js Instrumentation
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initializeAppInsights } = await import('./lib/appInsights');
    const { setupProcessCrashHandlers, startMemoryMonitoring } = await import('./lib/crashHandler');
    const { logger } = await import('./lib/logger');
    await initializeAppInsights({ cloudRoleName: process.env.WEBSITE_SITE_NAME || 'nextjs-azure-monitoring' });
    setupProcessCrashHandlers();
    startMemoryMonitoring(30000);
    logger.info({ runtime: process.env.NEXT_RUNTIME, nodeVersion: process.version, environment: process.env.NODE_ENV }, 'Server-side instrumentation initialized');
  }
  if (process.env.NEXT_RUNTIME === 'edge') { console.log('Edge runtime instrumentation initialized'); }
}

export function onRequestError(error: { digest: string } & Error, request: { path: string; method: string; headers: { [key: string]: string } }, context: { routerKind: 'Pages Router' | 'App Router'; routePath: string; routeType: 'render' | 'route' | 'action' | 'middleware'; renderSource?: string; revalidateReason?: string; renderType?: string }) {
  console.error('Request error:', { error: { message: error.message, digest: error.digest, stack: error.stack }, request: { path: request.path, method: request.method }, context });
  if (typeof global !== 'undefined') {
    import('./lib/appInsights').then(({ trackException, trackEvent }) => {
      trackException(error, { path: request.path, method: request.method, routerKind: context.routerKind, routePath: context.routePath, routeType: context.routeType, renderSource: context.renderSource || 'unknown' });
      trackEvent('RequestError', { path: request.path, method: request.method, routerKind: context.routerKind, routePath: context.routePath, routeType: context.routeType, errorMessage: error.message, errorDigest: error.digest });
    }).catch(() => {});
  }
}
