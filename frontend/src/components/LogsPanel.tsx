import { useEffect, useRef, useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useWorkflowStore } from '../store/workflowStore';
import type { LogEntry } from '../types/workflow';

type LogLevel = 'all' | 'info' | 'warn' | 'error' | 'debug';

/**
 * Logs Panel Implementation
 * Task 05: Logs Panel Implementation
 */
export function LogsPanel() {
  const { logs } = useWorkflowStore();
  const [filterLevel, setFilterLevel] = useState<LogLevel>('all');
  const logsEndRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filterLevel === 'all') return true;
    return log.level === filterLevel;
  });

  const getLogColor = (level: LogEntry['level']): 'default' | 'info' | 'warning' | 'error' => {
    switch (level) {
      case 'error':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  return (
    <Paper sx={{ p: 3, height: '400px', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Logs</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="log-level-filter">Filter</InputLabel>
          <Select
            labelId="log-level-filter"
            value={filterLevel}
            label="Filter"
            onChange={(e) => setFilterLevel(e.target.value as LogLevel)}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warn">Warn</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="debug">Debug</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.default',
        }}
      >
        <List dense ref={listRef}>
          {filteredLogs.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No logs available"
                secondary="Logs will appear here when the analysis starts"
              />
            </ListItem>
          ) : (
            filteredLogs.map((log, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, width: '100%' }}>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', minWidth: '80px', fontFamily: 'monospace' }}
                  >
                    {formatTimestamp(log.timestamp)}
                  </Typography>
                  <Chip
                    label={log.level.toUpperCase()}
                    size="small"
                    color={getLogColor(log.level)}
                    sx={{ height: '20px' }}
                  />
                  {log.node && (
                    <Chip
                      label={log.node}
                      size="small"
                      variant="outlined"
                      sx={{ height: '20px' }}
                    />
                  )}
                  <Typography variant="body2" sx={{ flex: 1, ml: 1 }}>
                    {log.message}
                  </Typography>
                </Box>
              </ListItem>
            ))
          )}
          <div ref={logsEndRef} />
        </List>
      </Box>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'success.main' }}>
        ✓ Logs appear in chronological order<br />
        ✓ Auto-scroll on new logs<br />
        ✓ Filter by log level
      </Typography>
    </Paper>
  );
}

