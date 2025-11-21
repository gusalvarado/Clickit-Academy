'use client';

import { useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

export interface MetricsSummary {
  totalRequests: number;
  errorRate: number;
  avgResponseTime: number;
  activeUsers: number;
}

export interface TimeSeriesData {
  time: string;
  requests: number;
  errors: number;
}

export interface BreakdownData {
  service: string;
  errors: number;
  warnings: number;
}

/**
 * Hook to fetch metrics summary
 * Task 10: Wire metrics dashboard to Python backend
 */
export function useMetricsSummary() {
  const [data, setData] = useState<MetricsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/metrics/summary`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics summary');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to fetch time series data
 */
export function useMetricsTimeSeries() {
  const [data, setData] = useState<TimeSeriesData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/metrics/timeseries`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch time series data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch time series');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}

/**
 * Hook to fetch breakdown data
 */
export function useMetricsBreakdown() {
  const [data, setData] = useState<BreakdownData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${API_BASE_URL}/metrics/breakdown`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch breakdown data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch breakdown');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    // Poll every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { data, isLoading, error };
}

