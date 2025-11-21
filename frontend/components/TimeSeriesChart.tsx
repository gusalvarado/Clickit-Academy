'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data - will be replaced with backend data in Task 10
const mockData = [
  { time: '00:00', requests: 120, errors: 2 },
  { time: '04:00', requests: 95, errors: 1 },
  { time: '08:00', requests: 210, errors: 5 },
  { time: '12:00', requests: 340, errors: 8 },
  { time: '16:00', requests: 280, errors: 6 },
  { time: '20:00', requests: 190, errors: 4 },
];

/**
 * Time Series Chart Component
 * Task 09: Add Recharts time-series and breakdown charts
 */
export function TimeSeriesChart({ data, isLoading, error }: {
  data?: typeof mockData;
  isLoading?: boolean;
  error?: string | null;
}) {
  const chartData = data || mockData;

  if (isLoading) {
    return (
      <Card className="border-terminal-border bg-terminal-bg-soft">
        <CardHeader>
          <CardTitle className="text-terminal-green">Request Timeline</CardTitle>
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
          <CardTitle className="text-terminal-green">Request Timeline</CardTitle>
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
        <CardTitle className="text-terminal-green">Request Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis
              dataKey="time"
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
            <Line
              type="monotone"
              dataKey="requests"
              stroke="#00ff41"
              strokeWidth={2}
              name="Requests"
            />
            <Line
              type="monotone"
              dataKey="errors"
              stroke="#ff4444"
              strokeWidth={2}
              name="Errors"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

