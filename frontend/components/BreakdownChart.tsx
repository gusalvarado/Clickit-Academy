'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - will be replaced with backend data in Task 10
const mockData = [
  { service: 'API', errors: 12, warnings: 8 },
  { service: 'Auth', errors: 3, warnings: 2 },
  { service: 'Database', errors: 5, warnings: 4 },
  { service: 'Cache', errors: 1, warnings: 1 },
];

/**
 * Breakdown Chart Component
 * Task 09: Add Recharts time-series and breakdown charts
 */
export function BreakdownChart({ data, isLoading, error }: {
  data?: typeof mockData;
  isLoading?: boolean;
  error?: string | null;
}) {
  const chartData = data || mockData;

  if (isLoading) {
    return (
      <Card className="border-terminal-border bg-terminal-bg-soft">
        <CardHeader>
          <CardTitle className="text-terminal-green">Errors by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full bg-terminal-bg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-terminal-border bg-terminal-bg-soft">
        <CardHeader>
          <CardTitle className="text-terminal-green">Errors by Service</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-400 text-sm">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-terminal-border bg-terminal-bg-soft">
      <CardHeader>
        <CardTitle className="text-terminal-green">Errors by Service</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="service"
              stroke="#888888"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#888888" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1a1a',
                border: '1px solid #2a2a2a',
                color: '#00ff41',
              }}
            />
            <Legend
              wrapperStyle={{ color: '#888888', fontSize: '12px' }}
            />
            <Bar dataKey="errors" fill="#ff4444" name="Errors" />
            <Bar dataKey="warnings" fill="#ffaa00" name="Warnings" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

