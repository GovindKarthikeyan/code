/**
 * Next.js Middleware
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

function generateRequestId(): string { return `req_${Date.now().toString(36)}_${Math.random().toString(36).substr(2, 9)}`; }

export function middleware(request: NextRequest) {
  const startTime = Date.now();
  const requestId = generateRequestId();
  const response = NextResponse.next();
  response.headers.set('X-Request-ID', requestId);
  response.headers.set('X-Response-Time', `${Date.now() - startTime}ms`);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  const logData = { requestId, method: request.method, url: request.url, pathname: request.nextUrl.pathname, userAgent: request.headers.get('user-agent')?.substring(0, 200), ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown', timestamp: new Date().toISOString() };
  console.log(JSON.stringify({ type: 'middleware_request', ...logData }));
  return response;
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'] };
