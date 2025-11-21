'use client';

import { MetricCard } from '@/components/MetricCard';
import { TimeSeriesChart } from '@/components/TimeSeriesChart';
import { BreakdownChart } from '@/components/BreakdownChart';
import { LogPanel } from '@/components/LogPanel';
import { useMetricsSummary, useMetricsTimeSeries, useMetricsBreakdown } from '@/hooks/useMetrics';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Dashboard Page
 * Tasks 08-11: Metrics, Charts, and Log Panel
 */
export default function DashboardPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useMetricsSummary();
  const { data: timeSeriesData, isLoading: timeSeriesLoading, error: timeSeriesError } = useMetricsTimeSeries();
  const { data: breakdownData, isLoading: breakdownLoading, error: breakdownError } = useMetricsBreakdown();

  // Use backend data if available, otherwise use mock data
  const metrics = summary
    ? [
        {
          title: 'Total Requests',
          value: summary.totalRequests.toLocaleString(),
          trend: { value: 12.5, isPositive: true },
          description: 'Last 24 hours',
        },
        {
          title: 'Error Rate',
          value: `${summary.errorRate.toFixed(1)}%`,
          trend: { value: 0.5, isPositive: false },
          description: 'Down from 2.8%',
        },
        {
          title: 'Avg Response Time',
          value: `${summary.avgResponseTime}ms`,
          trend: { value: 8.2, isPositive: true },
          description: 'Improved performance',
        },
        {
          title: 'Active Users',
          value: summary.activeUsers.toLocaleString(),
          trend: { value: 15.3, isPositive: true },
          description: 'Currently online',
        },
      ]
    : [
        {
          title: 'Total Requests',
          value: '12,345',
          trend: { value: 12.5, isPositive: true },
          description: 'Last 24 hours',
        },
        {
          title: 'Error Rate',
          value: '2.3%',
          trend: { value: 0.5, isPositive: false },
          description: 'Down from 2.8%',
        },
        {
          title: 'Avg Response Time',
          value: '145ms',
          trend: { value: 8.2, isPositive: true },
          description: 'Improved performance',
        },
        {
          title: 'Active Users',
          value: '1,234',
          trend: { value: 15.3, isPositive: true },
          description: 'Currently online',
        },
      ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-terminal-green mb-4">Dashboard</h2>
        
        {summaryError && (
          <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-500">
            <AlertDescription className="text-red-400">
              Failed to load metrics: {summaryError}
            </AlertDescription>
          </Alert>
        )}

        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <TimeSeriesChart
            data={timeSeriesData}
            isLoading={timeSeriesLoading}
            error={timeSeriesError}
          />
          <BreakdownChart
            data={breakdownData}
            isLoading={breakdownLoading}
            error={breakdownError}
          />
        </div>

        {/* Log Panel */}
        <LogPanel />
      </div>
    </div>
  );
}

