'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useRef } from 'react';

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  service?: string;
}

// Mock data - will be replaced with backend data
const mockLogs: LogEntry[] = [
  { timestamp: '2024-01-15 10:23:45', level: 'info', message: 'User login successful', service: 'Auth' },
  { timestamp: '2024-01-15 10:23:46', level: 'info', message: 'Request processed', service: 'API' },
  { timestamp: '2024-01-15 10:23:47', level: 'warn', message: 'High response time detected', service: 'API' },
  { timestamp: '2024-01-15 10:23:48', level: 'error', message: 'Database connection timeout', service: 'Database' },
  { timestamp: '2024-01-15 10:23:49', level: 'info', message: 'Cache updated', service: 'Cache' },
  { timestamp: '2024-01-15 10:23:50', level: 'debug', message: 'Request validation passed', service: 'API' },
];

/**
 * Log Panel Component
 * Task 11: Add terminal-style log panel and UI polish
 */
export function LogPanel({ logs, isLoading }: { logs?: LogEntry[]; isLoading?: boolean }) {
  const logContainerRef = useRef<HTMLDivElement>(null);
  const displayLogs = logs || mockLogs;

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [displayLogs]);

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error':
        return 'text-red-400';
      case 'warn':
        return 'text-yellow-400';
      case 'debug':
        return 'text-terminal-text-dim';
      default:
        return 'text-terminal-green';
    }
  };

  return (
    <Card className="border-terminal-border bg-terminal-bg-soft">
      <CardHeader>
        <CardTitle className="text-terminal-green">Recent Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={logContainerRef}
          className="h-64 overflow-y-auto bg-terminal-bg border border-terminal-border rounded p-4 font-mono text-sm"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#2a2a2a #0a0a0a',
          }}
        >
          {isLoading ? (
            <div className="text-terminal-text-dim">Loading logs...</div>
          ) : displayLogs.length === 0 ? (
            <div className="text-terminal-text-dim">No logs available</div>
          ) : (
            displayLogs.map((log, index) => (
              <div key={index} className="mb-2">
                <span className="text-terminal-text-dim">{log.timestamp}</span>
                {' '}
                <span className={getLevelColor(log.level)}>[{log.level.toUpperCase()}]</span>
                {log.service && (
                  <>
                    {' '}
                    <span className="text-terminal-green">[{log.service}]</span>
                  </>
                )}
                {' '}
                <span className="text-terminal-text">{log.message}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

