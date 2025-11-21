import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

/**
 * Metric Card Component
 * Task 08: Implement metric cards and summary section
 */
export function MetricCard({ title, value, trend, description }: MetricCardProps) {
  return (
    <Card className="border-terminal-border bg-terminal-bg-soft">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-terminal-text-dim">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-terminal-green">{value}</div>
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${
            trend.isPositive ? 'text-terminal-green' : 'text-red-400'
          }`}>
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-terminal-text-dim mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

