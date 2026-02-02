import Link from 'next/link';
import { getProcessHealth } from '@/lib/crashHandler';
import { trackEvent } from '@/lib/appInsights';

export const dynamic = 'force-dynamic';

async function getServerInfo() {
  const health = getProcessHealth();
  trackEvent('PageView', { page: 'home', path: '/' });
  return { uptime: Math.floor(health.uptime), memory: { heapUsed: Math.round(health.memoryUsage.heapUsed / 1024 / 1024), heapTotal: Math.round(health.memoryUsage.heapTotal / 1024 / 1024), rss: Math.round(health.memoryUsage.rss / 1024 / 1024) }, pid: health.pid, platform: health.platform, nodeVersion: health.nodeVersion, timestamp: new Date().toISOString() };
}

export default async function HomePage() {
  const serverInfo = await getServerInfo();
  return (
    <>
      <header className="header">
        <h1>Next.js Azure Monitoring Demo</h1>
        <p>Comprehensive error tracking, monitoring, and logging for Azure App Service</p>
        <nav className="nav"><Link href="/">Home</Link><Link href="/health">Health Check</Link><Link href="/test-errors">Test Errors</Link><Link href="/performance">Performance</Link></nav>
      </header>
      <main className="container">
        <div className="grid">
          <div className="card">
            <h2>🖥️ Server Status</h2>
            <div className="status-card healthy"><span className="badge badge-success">Healthy</span><span>Server is running normally</span></div>
            <table className="metrics-table"><tbody>
              <tr><td><strong>Uptime</strong></td><td>{serverInfo.uptime} seconds</td></tr>
              <tr><td><strong>Process ID</strong></td><td>{serverInfo.pid}</td></tr>
              <tr><td><strong>Platform</strong></td><td>{serverInfo.platform}</td></tr>
              <tr><td><strong>Node.js Version</strong></td><td>{serverInfo.nodeVersion}</td></tr>
              <tr><td><strong>Timestamp</strong></td><td>{serverInfo.timestamp}</td></tr>
            </tbody></table>
          </div>
          <div className="card">
            <h2>📊 Memory Usage</h2>
            <table className="metrics-table"><tbody>
              <tr><td><strong>Heap Used</strong></td><td>{serverInfo.memory.heapUsed} MB</td></tr>
              <tr><td><strong>Heap Total</strong></td><td>{serverInfo.memory.heapTotal} MB</td></tr>
              <tr><td><strong>RSS</strong></td><td>{serverInfo.memory.rss} MB</td></tr>
            </tbody></table>
          </div>
          <div className="card">
            <h2>🔍 Monitoring Features</h2>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.5rem 0' }}>✅ Application Insights Integration</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Server-side Error Tracking</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Client-side Error Tracking</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Process Crash Detection</li>
              <li style={{ padding: '0.5rem 0' }}>✅ OpenTelemetry Tracing</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Structured Logging</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Health Monitoring</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Middleware Tracking</li>
              <li style={{ padding: '0.5rem 0' }}>✅ API Route Monitoring</li>
              <li style={{ padding: '0.5rem 0' }}>✅ Server Action Tracking</li>
            </ul>
          </div>
          <div className="card">
            <h2>⚡ Quick Actions</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Link href="/test-errors" className="button button-error" style={{ textAlign: 'center' }}>Test Error Tracking</Link>
              <Link href="/health" className="button button-success" style={{ textAlign: 'center' }}>View Health Status</Link>
              <Link href="/performance" className="button button-warning" style={{ textAlign: 'center' }}>Performance Tests</Link>
              <a href="/api/health" className="button button-primary" style={{ textAlign: 'center' }}>API Health Check</a>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>📚 API Endpoints</h2>
          <div className="code-block">{`# Health Check\nGET /api/health\n\n# Detailed Health Check\nGET /api/health/detailed\n\n# Test Error Endpoints\nGET /api/test-error?type=<type>\nGET /api/crash-test\nGET /api/performance-test`}</div>
        </div>
      </main>
    </>
  );
}
