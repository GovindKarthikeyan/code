/**
 * Custom Server for Azure App Service with IIS and iisnode
 */
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

let isShuttingDown = false;
let server = null;

function handleHealthCheck(req, res) {
  const health = { status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime(), pid: process.pid, memory: process.memoryUsage() };
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(health));
}

async function startServer() {
  try {
    await app.prepare();
    server = createServer(async (req, res) => {
      try {
        const parsedUrl = parse(req.url, true);
        const { pathname } = parsedUrl;
        if (pathname === '/_health' || pathname === '/healthz') return handleHealthCheck(req, res);
        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error('Error handling request:', err);
        res.statusCode = 500;
        res.end('Internal Server Error');
      }
    });

    server.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> Environment: ${process.env.NODE_ENV}`);
      console.log(`> PID: ${process.pid}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      if (err.code === 'EADDRINUSE') { console.error(`Port ${port} is already in use`); process.exit(1); }
    });

    const shutdown = async (signal) => {
      if (isShuttingDown) { console.log('Shutdown already in progress'); return; }
      isShuttingDown = true;
      console.log(`${signal} received. Starting graceful shutdown...`);
      server.close(async (err) => {
        if (err) console.error('Error during server close:', err);
        console.log('Shutdown complete');
        process.exit(0);
      });
      setTimeout(() => { console.log('Forced shutdown after timeout'); process.exit(1); }, 30000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
