import Link from 'next/link';
import { getProcessHealth } from '@/lib/crashHandler';
import { getAppInsightsClient, trackEvent } from '@/lib/appInsights';
import * as os from 'os';

export const dynamic = 'force-dynamic';

async function getDetailedHealth() {
  const health = getProcessHealth();
  const appInsightsClient = getAppInsightsClient();
  trackEvent('HealthPageView', { page: 'health' });
  return {
    status: 'healthy', timestamp: new Date().toISOString(),
    process: { pid: health.pid, platform: health.platform, nodeVersion: health.nodeVersion, uptime: Math.floor(health.uptime) },
    memory: { heapUsed: Math.round(health.memoryUsage.heapUsed / 1024 / 1024), heapTotal: Math.round(health.memoryUsage.heapTotal / 1024 / 1024), rss: Math.round(health.memoryUsage.rss / 1024 / 1024), external: Math.round(health.memoryUsage.external / 1024 / 1024) },
    cpu: { user: Math.round(health.cpuUsage.user / 1000), system: Math.round(health.cpuUsage.system / 1000) },
    system: { hostname: os.hostname(), cpus: os.cpus().length, totalMemory: Math.round(os.totalmem() / 1024 / 1024), freeMemory: Math.round(os.freemem() / 1024 / 1024), loadAverage: os.loadavg().map(l => l.toFixed(2)) },
    monitoring: { appInsightsConfigured: !!appInsightsClient, environment: process.env.NODE_ENV || 'development', azureSite: process.env.WEBSITE_SITE_NAME || 'local' },
  };
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400); const hours = Math.floor((seconds % 86400) / 3600); const minutes = Math.floor((seconds % 3600) / 60); const secs = seconds % 60;
  if (days > 0) return `${days}d ${hours}h ${minutes}m`; else if (hours > 0) return `${hours}h ${minutes}m ${secs}s`; else if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function MemoryBar({ used, total }: { used: number; total: number }) {
  const percentage = Math.round((used / total) * 100);
  const color = percentage > 80 ? '#dc2626' : percentage > 60 ? '#d97706' : '#16a34a';
  return (<div style={{ marginTop: '4px', width: '100%', height: '8px', backgroundColor: '#e5e5e5', borderRadius: '4px', overflow: 'hidden' }}><div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, transition: 'width 0.3s ease' }} /></div>);
}

export default async function HealthPage() {
  const health = await getDetailedHealth();
  return (
    <>
      <header className="header">
        <h1>Health Monitoring Dashboard</h1>
        <p>Real-time health status and system metrics</p>
        <nav className="nav"><Link href="/">Home</Link><Link href="/health">Health Check</Link><Link href="/test-errors">Test Errors</Link><Link href="/performance">Performance</Link></nav>
      </header>
      <main className="container">
        <div className={`status-card ${health.status === 'healthy' ? 'healthy' : 'unhealthy'}`} style={{ marginBottom: '2rem' }}>
          <span className={`badge ${health.status === 'healthy' ? 'badge-success' : 'badge-error'}`}>{health.status.toUpperCase()}</span>
          <span style={{ fontSize: '1.25rem', fontWeight: 500 }}>System is operating normally</span>
          <span style={{ marginLeft: 'auto', color: '#666' }}>{health.timestamp}</span>
        </div>
        <div className="grid">
          <div className="card"><h2>🔧 Process Information</h2><table className="metrics-table"><tbody><tr><td><strong>Process ID</strong></td><td>{health.process.pid}</td></tr><tr><td><strong>Platform</strong></td><td>{health.process.platform}</td></tr><tr><td><strong>Node.js Version</strong></td><td>{health.process.nodeVersion}</td></tr><tr><td><strong>Uptime</strong></td><td>{formatUptime(health.process.uptime)}</td></tr></tbody></table></div>
          <div className="card"><h2>📊 Memory Usage</h2><table className="metrics-table"><tbody><tr><td><strong>Heap Used</strong></td><td>{health.memory.heapUsed} MB<MemoryBar used={health.memory.heapUsed} total={health.memory.heapTotal} /></td></tr><tr><td><strong>Heap Total</strong></td><td>{health.memory.heapTotal} MB</td></tr><tr><td><strong>RSS</strong></td><td>{health.memory.rss} MB</td></tr><tr><td><strong>External</strong></td><td>{health.memory.external} MB</td></tr></tbody></table></div>
          <div className="card"><h2>⚡ CPU Usage</h2><table className="metrics-table"><tbody><tr><td><strong>User Time</strong></td><td>{health.cpu.user} ms</td></tr><tr><td><strong>System Time</strong></td><td>{health.cpu.system} ms</td></tr></tbody></table></div>
          <div className="card"><h2>🖥️ System Information</h2><table className="metrics-table"><tbody><tr><td><strong>Hostname</strong></td><td>{health.system.hostname}</td></tr><tr><td><strong>CPU Cores</strong></td><td>{health.system.cpus}</td></tr><tr><td><strong>Total Memory</strong></td><td>{health.system.totalMemory} MB</td></tr><tr><td><strong>Free Memory</strong></td><td>{health.system.freeMemory} MB</td></tr><tr><td><strong>Load Average</strong></td><td>{health.system.loadAverage.join(', ')}</td></tr></tbody></table></div>
          <div className="card"><h2>📡 Monitoring Status</h2><table className="metrics-table"><tbody><tr><td><strong>Application Insights</strong></td><td><span className={`badge ${health.monitoring.appInsightsConfigured ? 'badge-success' : 'badge-warning'}`}>{health.monitoring.appInsightsConfigured ? 'Configured' : 'Not Configured'}</span></td></tr><tr><td><strong>Environment</strong></td><td><span className="badge badge-info">{health.monitoring.environment}</span></td></tr><tr><td><strong>Azure Site</strong></td><td>{health.monitoring.azureSite}</td></tr></tbody></table></div>
          <div className="card"><h2>🔗 API Endpoints</h2><div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}><a href="/api/health" target="_blank" className="button button-primary" style={{ textAlign: 'center' }}>Basic Health Check</a><a href="/api/health/detailed" target="_blank" className="button button-primary" style={{ textAlign: 'center' }}>Detailed Health Check</a></div></div>
        </div>
      </main>
    </>
  );
}
