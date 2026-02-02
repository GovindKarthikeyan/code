'use client';

import React, { useEffect } from 'react';
import { ErrorBoundary, setupClientErrorHandlers } from '@/lib/clientErrorTracking';

export function ErrorBoundaryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => { setupClientErrorHandlers(); }, []);
  return <ErrorBoundary onError={(error, errorInfo) => { console.error('ErrorBoundaryProvider caught error:', error, errorInfo); }}>{children}</ErrorBoundary>;
}
