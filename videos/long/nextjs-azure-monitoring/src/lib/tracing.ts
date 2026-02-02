/**
 * OpenTelemetry Tracing Module
 */
import { trace, SpanStatusCode, context, SpanKind, type Span, type Tracer } from '@opentelemetry/api';
import { logger } from './logger';

let tracerInstance: Tracer | null = null;

export function getTracer(name: string = 'nextjs-azure-monitoring'): Tracer {
  if (!tracerInstance) tracerInstance = trace.getTracer(name, process.env.APP_VERSION || '1.0.0');
  return tracerInstance;
}

export function createSpan(name: string, options?: { kind?: SpanKind; attributes?: Record<string, string | number | boolean> }): Span {
  return getTracer().startSpan(name, { kind: options?.kind || SpanKind.INTERNAL, attributes: options?.attributes });
}

export async function withSpan<T>(name: string, fn: (span: Span) => Promise<T>, options?: { kind?: SpanKind; attributes?: Record<string, string | number | boolean> }): Promise<T> {
  const tracer = getTracer();
  const span = tracer.startSpan(name, { kind: options?.kind || SpanKind.INTERNAL, attributes: options?.attributes });
  try {
    const result = await context.with(trace.setSpan(context.active(), span), async () => fn(span));
    span.setStatus({ code: SpanStatusCode.OK });
    return result;
  } catch (error) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: error instanceof Error ? error.message : 'Unknown error' });
    if (error instanceof Error) span.recordException(error);
    throw error;
  } finally { span.end(); }
}

export async function traceApiRoute<T>(method: string, route: string, fn: (span: Span) => Promise<T>): Promise<T> {
  return withSpan(`API ${method} ${route}`, fn, { kind: SpanKind.SERVER, attributes: { 'http.method': method, 'http.route': route, 'route.type': 'api-route' } });
}

export async function traceServerAction<T>(actionName: string, fn: (span: Span) => Promise<T>): Promise<T> {
  return withSpan(`ServerAction ${actionName}`, fn, { kind: SpanKind.SERVER, attributes: { 'action.name': actionName, 'action.type': 'server-action' } });
}

export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) span.setAttributes(attributes);
}

export function addSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const span = trace.getActiveSpan();
  if (span) span.addEvent(name, attributes);
}

export function recordSpanException(error: Error): void {
  const span = trace.getActiveSpan();
  if (span) { span.recordException(error); span.setStatus({ code: SpanStatusCode.ERROR, message: error.message }); }
  logger.error({ error: error.message, stack: error.stack }, 'Exception recorded in span');
}

export function getCurrentTraceId(): string | undefined { const span = trace.getActiveSpan(); return span ? span.spanContext().traceId : undefined; }
export function getCurrentSpanId(): string | undefined { const span = trace.getActiveSpan(); return span ? span.spanContext().spanId : undefined; }

export { SpanKind, SpanStatusCode };
