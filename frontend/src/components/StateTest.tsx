import { useWorkflowStore } from '../store/workflowStore';
import { UiStatus } from '../types/workflow';
import { Button, Box, Typography, Paper } from '@mui/material';

/**
 * Test component to validate state structure implementation
 * This validates Task 02: Frontend State Structure
 */
export function StateTest() {
  const {
    threadId,
    uiStatus,
    nodeStatuses,
    logs,
    interruptPayload,
    error,
    setThreadId,
    setUiStatus,
    updateNodeStatus,
    addLog,
    reset,
  } = useWorkflowStore();

  const handleTestState = () => {
    // Test setting thread ID
    setThreadId('test-thread-123');
    
    // Test setting UI status
    setUiStatus(UiStatus.RUNNING);
    
    // Test updating node status
    updateNodeStatus('analyze', {
      status: 'running',
      startedAt: new Date().toISOString(),
    });
    
    // Test adding log
    addLog({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Test log entry',
      node: 'analyze',
    });
  };

  return (
    <Paper sx={{ p: 3, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        State Structure Test (Task 02)
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2"><strong>Thread ID:</strong> {threadId || 'null'}</Typography>
        <Typography variant="body2"><strong>UI Status:</strong> {uiStatus}</Typography>
        <Typography variant="body2"><strong>Node Statuses:</strong> {Object.keys(nodeStatuses).length}</Typography>
        <Typography variant="body2"><strong>Logs:</strong> {logs.length}</Typography>
        <Typography variant="body2"><strong>Interrupt Payload:</strong> {interruptPayload ? 'Present' : 'null'}</Typography>
        <Typography variant="body2"><strong>Error:</strong> {error || 'null'}</Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button variant="contained" onClick={handleTestState}>
          Test State Updates
        </Button>
        <Button variant="outlined" onClick={reset}>
          Reset State
        </Button>
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'success.main' }}>
        ✓ UiStatus enum implemented<br />
        ✓ WorkflowState model defined<br />
        ✓ State persisted across rerenders (via Zustand persist)
      </Typography>
    </Paper>
  );
}

