'use client';
import { useState } from 'react';
import Link from 'next/link';
import { trackClientError } from '@/lib/clientErrorTracking';

export default function TestErrorsPage() {
  const [result, setResult] = useState<{ success?: boolean; error?: string; data?: unknown } | null>(null);
  const [loading, setLoading] = useState(false);

  const testApiError = async (errorType: string) => {
    setLoading(true); setResult(null);
    try { const response = await fetch(`/api/test-error?type=${errorType}`); const data = await response.json(); setResult({ success: response.ok, data }); }
    catch (error) { setResult({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }); }
    finally { setLoading(false); }
  };

  const triggerClientError = () => {
    try { 
      const obj: Record<string, unknown> = {}; 
      // @ts-expect-error - Intentional error for testing
      console.log(obj.nonexistent.property); 
    }
    catch (error) { if (error instanceof Error) { trackClientError(error, { source: 'test-button' }); setResult({ success: false, error: `Client error tracked: ${error.message}` }); } }
  };

  return (
    <>
      <header className="header">
        <h1>Error Testing Dashboard</h1>
        <p>Test various error scenarios and verify monitoring</p>
        <nav className="nav"><Link href="/">Home</Link><Link href="/health">Health Check</Link><Link href="/test-errors">Test Errors</Link><Link href="/performance">Performance</Link></nav>
      </header>
      <main className="container">
        <div className="grid">
          <div className="card">
            <h2>🖥️ Server-side Errors</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Test different types of server-side errors through API routes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="button button-error" onClick={() => testApiError('standard')} disabled={loading}>Standard Error</button>
              <button className="button button-error" onClick={() => testApiError('app')} disabled={loading}>Application Error</button>
              <button className="button button-error" onClick={() => testApiError('validation')} disabled={loading}>Validation Error</button>
              <button className="button button-error" onClick={() => testApiError('notfound')} disabled={loading}>Not Found Error</button>
              <button className="button button-success" onClick={() => testApiError('none')} disabled={loading}>No Error (Success)</button>
            </div>
          </div>
          <div className="card">
            <h2>🌐 Client-side Errors</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Test client-side error tracking</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className="button button-error" onClick={triggerClientError}>Tracked Client Error</button>
            </div>
          </div>
          <div className="card">
            <h2>💥 Process & Crash Tests</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Test process-level error handling</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <a href="/api/crash-test" target="_blank" className="button button-primary" style={{ textAlign: 'center' }}>View Crash Test Info</a>
              <a href="/api/crash-test?type=childProcessCrash" target="_blank" className="button button-warning" style={{ textAlign: 'center' }}>Child Process Crash</a>
              <a href="/api/crash-test?type=memoryLeak" target="_blank" className="button button-warning" style={{ textAlign: 'center' }}>Memory Pressure Test</a>
            </div>
          </div>
          <div className="card">
            <h2>⚡ Server Actions</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Test server action error handling</p>
            <ServerActionTests />
          </div>
        </div>
        {(result || loading) && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2>📋 Result</h2>
            {loading ? <p>Loading...</p> : result ? <div className={`result-box ${result.success ? 'success' : 'error'}`}>{JSON.stringify(result, null, 2)}</div> : null}
          </div>
        )}
      </main>
    </>
  );
}

function ServerActionTests() {
  const [actionResult, setActionResult] = useState<string | null>(null);
  const testSuccessAction = async () => { const { testSuccessAction } = await import('@/app/actions/testActions'); const result = await testSuccessAction('test-data'); setActionResult(JSON.stringify(result, null, 2)); };
  const testErrorAction = async () => { const { testErrorAction } = await import('@/app/actions/testActions'); const result = await testErrorAction(); setActionResult(JSON.stringify(result, null, 2)); };
  const testValidationAction = async () => { const { testValidationAction } = await import('@/app/actions/testActions'); const result = await testValidationAction(''); setActionResult(JSON.stringify(result, null, 2)); };
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className="button button-success" onClick={testSuccessAction}>Success Action</button>
        <button className="button button-error" onClick={testErrorAction}>Error Action</button>
        <button className="button button-warning" onClick={testValidationAction}>Validation Action</button>
      </div>
      {actionResult && <div className="result-box success" style={{ marginTop: '1rem' }}>{actionResult}</div>}
    </>
  );
}
