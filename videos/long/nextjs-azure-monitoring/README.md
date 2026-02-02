# Next.js Azure Monitoring Demo

A comprehensive Next.js application demonstrating error tracking, monitoring, logging, and Azure App Service deployment.

## Features

- ✅ Azure Application Insights Integration
- ✅ Server-side Error Tracking (uncaught exceptions, unhandled rejections)
- ✅ Client-side Error Tracking (React error boundaries, global handlers)
- ✅ Process Crash Detection (main and child processes)
- ✅ OpenTelemetry Tracing with spans
- ✅ Structured Logging with Pino
- ✅ Health Monitoring endpoints
- ✅ Middleware request tracking
- ✅ API Route monitoring
- ✅ Server Action tracking
- ✅ Azure App Service + IIS + iisnode configuration

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local

# Development
npm run dev

# Production build
npm run build

# Production server
npm start
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `APPLICATIONINSIGHTS_CONNECTION_STRING` | Azure Application Insights connection string |
| `NODE_ENV` | Environment (development/production) |
| `LOG_LEVEL` | Logging level (trace/debug/info/warn/error/fatal) |
| `APP_VERSION` | Application version for telemetry |

## API Endpoints

- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system information
- `GET /api/test-error?type=<type>` - Test different error types
- `GET /api/crash-test` - Process crash test scenarios
- `GET /api/performance-test` - Performance benchmarks
- `POST /api/client-telemetry` - Client-side telemetry receiver

## Pages

- `/` - Home dashboard with server status
- `/health` - Health monitoring dashboard
- `/test-errors` - Error testing interface
- `/performance` - Performance testing interface

## Azure Deployment

1. Create Azure Application Insights resource
2. Get connection string from Azure Portal
3. Create Azure App Service (Windows)
4. Configure app settings:
   - `APPLICATIONINSIGHTS_CONNECTION_STRING=<your-connection-string>`
   - `NODE_ENV=production`
   - `WEBSITE_NODE_DEFAULT_VERSION=~20`
5. Deploy application

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── actions/           # Server Actions
│   └── [pages]/           # Page components
├── components/            # React components
└── lib/                   # Core libraries
    ├── appInsights.ts     # Application Insights
    ├── logger.ts          # Structured logging
    ├── tracing.ts         # OpenTelemetry tracing
    ├── crashHandler.ts    # Process crash handling
    └── errorHandler.ts    # Error handling utilities
```

## License

MIT
