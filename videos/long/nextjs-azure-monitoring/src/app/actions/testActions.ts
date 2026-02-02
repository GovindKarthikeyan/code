'use server';
import { trackEvent } from '@/lib/appInsights';
import { logger } from '@/lib/logger';
import { traceServerAction } from '@/lib/tracing';
import { handleServerActionError, ValidationError } from '@/lib/errorHandler';

export async function testSuccessAction(data: string) {
  return traceServerAction('testSuccessAction', async (span) => {
    span.setAttribute('input.data', data);
    logger.info({ data }, 'testSuccessAction called');
    trackEvent('ServerActionCalled', { action: 'testSuccessAction', success: 'true' });
    await new Promise(resolve => setTimeout(resolve, 100));
    return { success: true, message: 'Action completed successfully', data, timestamp: new Date().toISOString() };
  });
}

export async function testErrorAction() {
  return traceServerAction('testErrorAction', async (span) => {
    span.setAttribute('error.expected', true);
    logger.info('testErrorAction called - will throw error');
    trackEvent('ServerActionCalled', { action: 'testErrorAction', willError: 'true' });
    try {
      await new Promise(resolve => setTimeout(resolve, 50));
      throw new Error('Intentional server action error for testing');
    } catch (error) { return handleServerActionError(error, 'testErrorAction'); }
  });
}

export async function testValidationAction(input: string) {
  return traceServerAction('testValidationAction', async (span) => {
    span.setAttribute('input.length', input.length);
    logger.info({ inputLength: input.length }, 'testValidationAction called');
    trackEvent('ServerActionCalled', { action: 'testValidationAction', inputLength: String(input.length) });
    try {
      if (!input || input.trim().length === 0) throw new ValidationError('Input is required and cannot be empty');
      if (input.length < 3) throw new ValidationError('Input must be at least 3 characters');
      if (input.length > 100) throw new ValidationError('Input must not exceed 100 characters');
      return { success: true, message: 'Validation passed', input, timestamp: new Date().toISOString() };
    } catch (error) { return handleServerActionError(error, 'testValidationAction'); }
  });
}
