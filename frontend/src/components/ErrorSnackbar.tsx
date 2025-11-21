import { useEffect, useState } from 'react';
import { Snackbar, Alert, Button, Box } from '@mui/material';
import { useWorkflowStore } from '../store/workflowStore';

/**
 * Error Snackbar Component
 * Task 08: Global Error Handling
 */
export function ErrorSnackbar() {
  const { error, setError } = useWorkflowStore();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (error) {
      setOpen(true);
    }
  }, [error]);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setError(null);
  };

  const handleRetry = () => {
    // Clear the error to allow user to retry the action
    // Actual retry happens when user triggers the action again
    // (e.g., clicking "Run Analysis" button again)
    setOpen(false);
    setError(null);
  };

  if (!error) {
    return null;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity="error"
        sx={{ width: '100%' }}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" size="small" onClick={handleRetry}>
              Retry
            </Button>
          </Box>
        }
      >
        {error}
      </Alert>
    </Snackbar>
  );
}

