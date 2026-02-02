'use client';
import { useState } from 'react';
import Link from 'next/link';

interface PerformanceResult { success: boolean; testType: string; testsRun: number; requestId: string; timestamp: string; tests: { cpu?: { duration: number; result: number }; memory?: { duration: number; memoryAllocated: string }; async?: { duration: number; tasks: number; expectedMinDuration: number }; dependency?: { duration: number; success: boolean; target: string } } }

export default function PerformancePage() {
  const [result, setResult] = useState<PerformanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTest, setSelectedTest] = useState('all');

  const runPerformanceTest = async (testType: string) => {
    setLoading(true); setSelectedTest(testType);
    try { const response = await fetch(`/api/performance-test?type=${testType}`); const data = await response.json(); setResult(data); }
    catch (error) { console.error('Performance test failed:', error); }
    finally { setLoading(false); }
  };

  return (
    <>
      <header className="header">
        <h1>Performance Testing Dashboard</h1>
        <p>Run performance tests and view metrics</p>
        <nav className="nav"><Link href="/">Home</Link><Link href="/health">Health Check</Link><Link href="/test-errors">Test Errors</Link><Link href="/performance">Performance</Link></nav>
      </header>
      <main className="container">
        <div className="grid">
          <div className="card">
            <h2>🎯 Performance Tests</h2>
            <p style={{ marginBottom: '1rem', color: '#666' }}>Select and run different performance tests</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button className={`button ${selectedTest === 'all' ? 'button-primary' : 'button-warning'}`} onClick={() => runPerformanceTest('all')} disabled={loading}>Run All Tests</button>
              <button className="button button-primary" onClick={() => runPerformanceTest('cpu')} disabled={loading}>CPU Intensive Test</button>
              <button className="button button-primary" onClick={() => runPerformanceTest('memory')} disabled={loading}>Memory Allocation Test</button>
              <button className="button button-primary" onClick={() => runPerformanceTest('async')} disabled={loading}>Async Operations Test</button>
              <button className="button button-primary" onClick={() => runPerformanceTest('dependency')} disabled={loading}>Dependency Call Test</button>
            </div>
          </div>
          <div className="card">
            <h2>📚 Test Descriptions</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}><strong>CPU Intensive:</strong> Performs 1M math operations</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}><strong>Memory Allocation:</strong> Allocates and releases memory</li>
              <li style={{ padding: '0.5rem 0', borderBottom: '1px solid #eee' }}><strong>Async Operations:</strong> Parallel async tasks</li>
              <li style={{ padding: '0.5rem 0' }}><strong>Dependency Call:</strong> Simulated external API call</li>
            </ul>
          </div>
        </div>
        {(loading || result) && (
          <div className="card" style={{ marginTop: '2rem' }}>
            <h2>📊 Test Results</h2>
            {loading ? <div style={{ textAlign: 'center', padding: '2rem' }}><p>Running performance tests...</p></div> : result ? (
              <>
                <div style={{ marginBottom: '1rem' }}><span className="badge badge-success">{result.testsRun} tests completed</span><span style={{ marginLeft: '1rem', color: '#666' }}>{result.timestamp}</span></div>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                  {result.tests.cpu && <div className="status-card healthy"><div><h3 style={{ margin: 0 }}>CPU Test</h3><p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{result.tests.cpu.duration}ms</p></div></div>}
                  {result.tests.memory && <div className="status-card healthy"><div><h3 style={{ margin: 0 }}>Memory Test</h3><p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{result.tests.memory.duration}ms</p><p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Allocated: {result.tests.memory.memoryAllocated}</p></div></div>}
                  {result.tests.async && <div className="status-card healthy"><div><h3 style={{ margin: 0 }}>Async Test</h3><p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{result.tests.async.duration}ms</p><p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>{result.tests.async.tasks} parallel tasks</p></div></div>}
                  {result.tests.dependency && <div className={`status-card ${result.tests.dependency.success ? 'healthy' : 'warning'}`}><div><h3 style={{ margin: 0 }}>Dependency Test</h3><p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>{result.tests.dependency.duration}ms</p><p style={{ margin: 0, color: '#666', fontSize: '0.875rem' }}>Target: {result.tests.dependency.target}</p></div></div>}
                </div>
                <details style={{ marginTop: '1rem' }}><summary style={{ cursor: 'pointer', color: '#0070f3' }}>View Raw JSON</summary><pre className="code-block" style={{ marginTop: '0.5rem' }}>{JSON.stringify(result, null, 2)}</pre></details>
              </>
            ) : null}
          </div>
        )}
      </main>
    </>
  );
}
