import { ThemeProvider, createTheme, CssBaseline, Container, Box, Typography } from '@mui/material';
import { StateTest } from './components/StateTest';
import { FileSelector } from './components/FileSelector';
import { WorkflowVisualization } from './components/WorkflowVisualization';
import { LogsPanel } from './components/LogsPanel';
import { HumanSupervisionModal } from './components/HumanSupervisionModal';
import { StatusPollingProvider } from './components/StatusPollingProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorSnackbar } from './components/ErrorSnackbar';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <StatusPollingProvider>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Clickit Academy - Security Analysis Frontend
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', md: 'row' } }}>
              <Box sx={{ flex: { xs: '1', md: '0 0 33%' } }}>
                <FileSelector />
              </Box>
              <Box sx={{ flex: { xs: '1', md: '0 0 65%' }, display: 'flex', flexDirection: 'column', gap: 3 }}>
                <WorkflowVisualization />
                <LogsPanel />
                <StateTest />
              </Box>
            </Box>
            
            <HumanSupervisionModal />
            <ErrorSnackbar />
          </Container>
        </StatusPollingProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
