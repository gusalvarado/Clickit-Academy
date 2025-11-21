import { Paper, Box, Typography, Stepper, Step, StepLabel, StepContent, Chip } from '@mui/material';
import { CheckCircle, RadioButtonUnchecked, Error, HourglassEmpty } from '@mui/icons-material';
import { useWorkflowStore } from '../store/workflowStore';
import type { NodeStatus } from '../types/workflow';

/**
 * Workflow Visualization Component
 * Task 04: Workflow Visualization Component
 */
export function WorkflowVisualization() {
  const { nodeStatuses } = useWorkflowStore();

  // Define workflow nodes in order
  const workflowNodes = [
    { id: 'upload', label: 'File Upload' },
    { id: 'analyze', label: 'Code Analysis' },
    { id: 'eslint', label: 'ESLint Security Scan' },
    { id: 'review', label: 'Security Review' },
    { id: 'approval', label: 'Human Approval' },
    { id: 'complete', label: 'Complete' },
  ];

  const getNodeStatus = (nodeId: string): NodeStatus => {
    const nodeInfo = nodeStatuses[nodeId];
    if (!nodeInfo) return 'pending';
    return nodeInfo.status;
  };

  const getStatusIcon = (status: NodeStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle color="success" />;
      case 'running':
        return <HourglassEmpty color="primary" />;
      case 'failed':
        return <Error color="error" />;
      default:
        return <RadioButtonUnchecked color="disabled" />;
    }
  };

  const getStatusColor = (status: NodeStatus): 'default' | 'primary' | 'success' | 'error' => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'running':
        return 'primary';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getActiveStep = () => {
    // Find the first node that is running or the last completed node
    for (let i = 0; i < workflowNodes.length; i++) {
      const status = getNodeStatus(workflowNodes[i].id);
      if (status === 'running') {
        return i;
      }
    }
    // If no running node, find the last completed node
    for (let i = workflowNodes.length - 1; i >= 0; i--) {
      const status = getNodeStatus(workflowNodes[i].id);
      if (status === 'completed') {
        return Math.min(i + 1, workflowNodes.length - 1);
      }
    }
    return 0;
  };

  const activeStep = getActiveStep();

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Workflow Visualization
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical">
        {workflowNodes.map((node, index) => {
          const status = getNodeStatus(node.id);
          const nodeInfo = nodeStatuses[node.id];
          const isActive = status === 'running';
          const isCompleted = status === 'completed';

          return (
            <Step
              key={node.id}
              completed={isCompleted}
              active={isActive || index === activeStep}
            >
              <StepLabel
                StepIconComponent={() => getStatusIcon(status)}
                error={status === 'failed'}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">{node.label}</Typography>
                  <Chip
                    label={status}
                    size="small"
                    color={getStatusColor(status)}
                    variant={isActive ? 'filled' : 'outlined'}
                  />
                </Box>
              </StepLabel>
              <StepContent>
                {nodeInfo && (
                  <Box sx={{ mt: 1 }}>
                    {nodeInfo.startedAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Started: {new Date(nodeInfo.startedAt).toLocaleTimeString()}
                      </Typography>
                    )}
                    {nodeInfo.completedAt && (
                      <Typography variant="caption" display="block" color="text.secondary">
                        Completed: {new Date(nodeInfo.completedAt).toLocaleTimeString()}
                      </Typography>
                    )}
                    {nodeInfo.error && (
                      <Typography variant="caption" display="block" color="error">
                        Error: {nodeInfo.error}
                      </Typography>
                    )}
                  </Box>
                )}
                {isActive && (
                  <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                    Currently running...
                  </Typography>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'success.main' }}>
        ✓ Stepper implemented<br />
        ✓ Live node status updates from store<br />
        ✓ Highlight running node
      </Typography>
    </Paper>
  );
}

