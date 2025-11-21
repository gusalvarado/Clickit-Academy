import type { ReactNode } from 'react';
import { useStatusPolling } from '../hooks/useStatusPolling';

interface StatusPollingProviderProps {
  children: ReactNode;
}

/**
 * Provider component that enables status polling
 * Task 07: Implement Status Polling Runner
 */
export function StatusPollingProvider({ children }: StatusPollingProviderProps) {
  useStatusPolling();
  return <>{children}</>;
}

