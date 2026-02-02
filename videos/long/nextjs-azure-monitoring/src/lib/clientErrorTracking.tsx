'use client';

import React, { Component, ErrorInfo, ReactNode, useEffect } from 'react';

interface ClientTelemetry { error: { message: string; name: string; stack?: string }; context?: Record<string, unknown>; url: string; userAgent: string; timestamp: string }

async function sendTelemetry(telemetry: ClientTelemetry): Promise<void> {
  try { await fetch('/api/client-telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(telemetry) }); } catch (error) { console.error('Failed to send telemetry:', error); }
}

export function trackClientError(error: Error, context?: Record<string, unknown>): void {
  sendTelemetry({ error: { message: error.message, name: error.name, stack: error.stack }, context, url: typeof window !== 'undefined' ? window.location.href : '', userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '', timestamp: new Date().toISOString() });
}

export function setupClientErrorHandlers(): void {
  if (typeof window === 'undefined') return;
  window.onerror = (message, source, lineno, colno, error) => { trackClientError(error || new Error(String(message)), { source, lineno, colno, type: 'window.onerror' }); return false; };
  window.onunhandledrejection = (event) => { const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason)); trackClientError(error, { type: 'unhandledrejection' }); };
  console.log('Client error handlers initialized');
}

interface ErrorBoundaryProps { children: ReactNode; fallback?: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }
interface ErrorBoundaryState { hasError: boolean; error: Error | null; errorInfo: ErrorInfo | null }

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) { super(props); this.state = { hasError: false, error: null, errorInfo: null }; }
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> { return { hasError: true, error }; }
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    trackClientError(error, { type: 'react-error-boundary', componentStack: errorInfo.componentStack });
    if (this.props.onError) this.props.onError(error, errorInfo);
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }
  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{ padding: '20px', margin: '20px', backgroundColor: '#fee2e2', border: '1px solid #ef4444', borderRadius: '8px' }}>
          <h2 style={{ color: '#dc2626', marginBottom: '10px' }}>Something went wrong</h2>
          <p style={{ color: '#7f1d1d' }}>An error occurred while rendering this component.</p>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '10px' }}><summary style={{ cursor: 'pointer', color: '#b91c1c' }}>Error Details</summary>
              <pre style={{ marginTop: '10px', padding: '10px', backgroundColor: '#fef2f2', overflow: 'auto', fontSize: '12px' }}>{this.state.error.toString()}{this.state.errorInfo?.componentStack}</pre>
            </details>
          )}
          <button onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })} style={{ marginTop: '15px', padding: '8px 16px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Try Again</button>
        </div>
      );
    }
    return this.props.children;
  }
}

export function reportWebVitals(metric: { id: string; name: string; value: number; rating: 'good' | 'needs-improvement' | 'poor'; delta: number; navigationType: string }): void {
  console.log('Web Vital:', metric);
  fetch('/api/client-telemetry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'web-vital', metric, url: typeof window !== 'undefined' ? window.location.href : '', timestamp: new Date().toISOString() }) }).catch(() => {});
}
