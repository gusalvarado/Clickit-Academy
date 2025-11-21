import { useEffect, useRef } from 'react';
import { useWorkflowStore } from '../store/workflowStore';
import { UiStatus } from '../types/workflow';
import { getStatus } from '../utils/api';

const POLLING_INTERVAL = 2000; // 2 seconds

/**
 * Custom hook for polling backend status
 * Task 07: Implement Status Polling Runner
 */
export function useStatusPolling() {
  const { threadId, uiStatus, setUiStatus, setLogs, updateNodeStatus, setInterruptPayload, setError, setCompletedAt } = useWorkflowStore();
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    // Only poll when status is running and we have a thread ID
    if (uiStatus !== UiStatus.RUNNING || !threadId) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Poll immediately on mount/status change
    const pollStatus = async () => {
      try {
        const data = await getStatus(threadId);

        // Update logs
        if (data.logs && data.logs.length > 0) {
          const newLogs = data.logs.map((log) => ({
            timestamp: log.timestamp,
            level: log.level,
            message: log.message,
            node: log.node || undefined,
          }));
          setLogs(newLogs);
        }

        // Update node statuses
        if (data.node_statuses) {
          Object.entries(data.node_statuses).forEach(([nodeId, statusInfo]) => {
            updateNodeStatus(nodeId, {
              status: statusInfo.status,
              startedAt: statusInfo.started_at,
              completedAt: statusInfo.completed_at || undefined,
              error: statusInfo.error || undefined,
            });
          });
        }

        // Handle interrupt payload
        if (data.interrupt_payload) {
          const interruptPayload = {
            nodeId: data.interrupt_payload.nodeId,
            findings: data.interrupt_payload.findings.map((finding) => ({
              rule: finding.rule,
              severity: finding.severity,
              message: finding.message,
              line: finding.line ?? undefined,
              column: finding.column ?? undefined,
            })),
            message: data.interrupt_payload.message ?? undefined,
          };
          setInterruptPayload(interruptPayload);
          setUiStatus(UiStatus.INTERRUPTED);
        }

        // Check if completed
        if (data.status === 'completed') {
          setUiStatus(UiStatus.COMPLETED);
          setCompletedAt(new Date().toISOString());
        }

        // Check if error
        if (data.status === 'error') {
          setUiStatus(UiStatus.ERROR);
          setError(data.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Error polling status:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch status');
        // Don't stop polling on transient errors, but log them
      }
    };

    // Initial poll
    pollStatus();

    // Set up interval
    intervalRef.current = setInterval(pollStatus, POLLING_INTERVAL);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [threadId, uiStatus, setUiStatus, setLogs, updateNodeStatus, setInterruptPayload, setError, setCompletedAt]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);
}

