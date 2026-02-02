import type { Metadata } from 'next';
import { ErrorBoundaryProvider } from '@/components/ErrorBoundaryProvider';
import './globals.css';

export const metadata: Metadata = { title: 'Next.js Azure Monitoring Demo', description: 'A comprehensive Next.js application with Azure Application Insights monitoring' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body><ErrorBoundaryProvider>{children}</ErrorBoundaryProvider></body></html>);
}
