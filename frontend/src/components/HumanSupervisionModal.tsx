import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Warning, CheckCircle, Cancel } from '@mui/icons-material';
import { useWorkflowStore } from '../store/workflowStore';
import { UiStatus } from '../types/workflow';
import type { SecurityFinding } from '../types/workflow';
import { resumeWorkflow } from '../utils/api';

/**
 * Human Supervision UI for Interrupts
 * Task 06: Human Supervision UI for Interrupts
 */
export function HumanSupervisionModal() {
  const { interruptPayload, setInterruptPayload, setUiStatus, threadId } = useWorkflowStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isOpen = interruptPayload !== null;

  const handleApprove = async () => {
    if (!interruptPayload || !threadId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await resumeWorkflow(threadId, 'approve');

      if (response.status === 'running') {
        // Clear interrupt and resume workflow
        setInterruptPayload(null);
        setUiStatus(UiStatus.RUNNING);
      } else {
        setError(response.message || 'Failed to resume workflow');
        setUiStatus(UiStatus.ERROR);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve');
      setUiStatus(UiStatus.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!interruptPayload || !threadId) return;

    setIsProcessing(true);
    setError(null);

    try {
      const response = await resumeWorkflow(threadId, 'reject');

      // Clear interrupt and stop workflow
      setInterruptPayload(null);
      setUiStatus(UiStatus.ERROR);
      
      if (response.message) {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject');
      setUiStatus(UiStatus.ERROR);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setInterruptPayload(null);
    }
  };

  const getSeverityColor = (severity: SecurityFinding['severity']): 'error' | 'warning' | 'info' => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (!interruptPayload) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={isProcessing}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="warning" />
          <Typography variant="h6">Human Supervision Required</Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Critical security findings detected. Please review and decide whether to proceed.
        </Alert>

        {interruptPayload.message && (
          <Typography variant="body1" sx={{ mb: 2 }}>
            {interruptPayload.message}
          </Typography>
        )}

        <Typography variant="h6" gutterBottom>
          Security Findings ({interruptPayload.findings.length})
        </Typography>

        <List>
          {interruptPayload.findings.map((finding, index) => (
            <ListItem
              key={index}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                bgcolor: 'background.default',
              }}
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {finding.rule}
                    </Typography>
                    <Chip
                      label={finding.severity.toUpperCase()}
                      size="small"
                      color={getSeverityColor(finding.severity)}
                    />
                    {finding.line && (
                      <Typography variant="caption" color="text.secondary">
                        Line {finding.line}
                        {finding.column && `, Column ${finding.column}`}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={finding.message}
              />
            </ListItem>
          ))}
        </List>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
        >
          Cancel
        </Button>
        <Button
          onClick={handleReject}
          color="error"
          variant="outlined"
          startIcon={isProcessing ? <CircularProgress size={16} /> : <Cancel />}
          disabled={isProcessing}
        >
          Reject
        </Button>
        <Button
          onClick={handleApprove}
          color="success"
          variant="contained"
          startIcon={isProcessing ? <CircularProgress size={16} /> : <CheckCircle />}
          disabled={isProcessing}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}

