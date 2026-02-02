/**
 * Error Handler Module
 */
import { NextResponse } from 'next/server';
import { trackException, trackEvent } from './appInsights';
import { logger } from './logger';
import { recordSpanException, addSpanAttributes } from './tracing';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly context?: Record<string, unknown>;
  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', isOperational: boolean = true, context?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.context = context;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) { super(message, 400, 'VALIDATION_ERROR', true, context); this.name = 'ValidationError'; }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) { super(`${resource}${identifier ? ` with identifier ${identifier}` : ''} not found`, 404, 'NOT_FOUND', true, { resource, identifier }); this.name = 'NotFoundError'; }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') { super(message, 401, 'AUTHENTICATION_ERROR', true); this.name = 'AuthenticationError'; }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') { super(message, 403, 'AUTHORIZATION_ERROR', true); this.name = 'AuthorizationError'; }
}

export interface ErrorResponse { error: { message: string; code: string; statusCode: number; timestamp: string; requestId?: string; details?: Record<string, unknown> } }

export function handleApiError(error: unknown, requestId?: string): NextResponse<ErrorResponse> {
  const timestamp = new Date().toISOString();
  if (error instanceof AppError) {
    logger.error({ err: { message: error.message, name: error.name, stack: error.stack }, type: 'operational', errorCode: error.errorCode, statusCode: error.statusCode, requestId }, error.message);
    trackException(error, { type: 'ApiError', errorCode: error.errorCode, statusCode: String(error.statusCode), isOperational: 'true', requestId: requestId || 'unknown' });
    addSpanAttributes({ 'error.type': 'operational', 'error.code': error.errorCode, 'http.status_code': error.statusCode });
    return NextResponse.json<ErrorResponse>({ error: { message: error.message, code: error.errorCode, statusCode: error.statusCode, timestamp, requestId, details: error.context } }, { status: error.statusCode });
  }
  const unexpectedError = error instanceof Error ? error : new Error(String(error));
  logger.error({ err: { message: unexpectedError.message, name: unexpectedError.name, stack: unexpectedError.stack }, type: 'unexpected', requestId }, unexpectedError.message);
  trackException(unexpectedError, { type: 'ApiError', errorCode: 'INTERNAL_ERROR', statusCode: '500', isOperational: 'false', requestId: requestId || 'unknown' });
  recordSpanException(unexpectedError);
  const message = process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : unexpectedError.message;
  return NextResponse.json<ErrorResponse>({ error: { message, code: 'INTERNAL_ERROR', statusCode: 500, timestamp, requestId } }, { status: 500 });
}

export function handleServerActionError(error: unknown, actionName: string): { success: false; error: string; code: string } {
  const errorObj = error instanceof Error ? error : new Error(String(error));
  logger.error({ err: { message: errorObj.message, name: errorObj.name, stack: errorObj.stack }, type: 'serverAction', actionName }, errorObj.message);
  trackException(errorObj, { type: 'ServerActionError', actionName, isOperational: error instanceof AppError ? 'true' : 'false' });
  trackEvent('ServerActionError', { actionName, errorMessage: errorObj.message, errorName: errorObj.name });
  recordSpanException(errorObj);
  if (error instanceof AppError) return { success: false, error: error.message, code: error.errorCode };
  return { success: false, error: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : errorObj.message, code: 'INTERNAL_ERROR' };
}
