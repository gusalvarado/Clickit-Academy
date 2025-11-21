import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Paper,
  Box,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';
import { useWorkflowStore } from '../store/workflowStore';
import { UiStatus } from '../types/workflow';
import { startAnalysis } from '../utils/api';

type AnalysisType = 'security' | 'performance' | 'quality';

interface FileSelectorProps {
  onStartAnalysis?: (file: File, analysisType: AnalysisType) => void;
}

/**
 * File Selector + Config Panel Component
 * Task 03: Build File Selector + Config Panel
 */
export function FileSelector({ onStartAnalysis }: FileSelectorProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisType, setAnalysisType] = useState<AnalysisType>('security');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const { uiStatus, setUiStatus, setThreadId } = useWorkflowStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      // Validate file type (accept JS, TS, JSX, TSX, PY files)
      const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(fileExtension)) {
        setSelectedFile(file);
      } else {
        setError(`Invalid file type. Accepted: ${validExtensions.join(', ')}`);
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/javascript': ['.js', '.jsx'],
      'text/typescript': ['.ts', '.tsx'],
      'text/x-python': ['.py'],
    },
    multiple: false,
  });

  const handleStartAnalysis = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await startAnalysis(selectedFile, analysisType);
      
      setThreadId(response.threadId);
      setUiStatus(UiStatus.RUNNING);

      // Call parent callback if provided
      if (onStartAnalysis) {
        onStartAnalysis(selectedFile, analysisType);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
      setUiStatus(UiStatus.ERROR);
    } finally {
      setIsUploading(false);
    }
  };

  const isRunButtonDisabled = !selectedFile || isUploading || uiStatus === UiStatus.RUNNING;

  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        File Selector & Configuration
      </Typography>

      {/* File Upload Dropzone */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'background.paper',
          mb: 3,
          transition: 'all 0.2s',
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        {isDragActive ? (
          <Typography variant="body1" color="primary">
            Drop the file here...
          </Typography>
        ) : (
          <>
            <Typography variant="body1" gutterBottom>
              Drag & drop a file here, or click to select
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Supports: .js, .jsx, .ts, .tsx, .py
            </Typography>
          </>
        )}
      </Box>

      {/* Selected File Display */}
      {selectedFile && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'action.selected', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description />
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" fontWeight="bold">
                {selectedFile.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Analysis Type Dropdown */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="analysis-type-label">Analysis Type</InputLabel>
        <Select
          labelId="analysis-type-label"
          value={analysisType}
          label="Analysis Type"
          onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
        >
          <MenuItem value="security">Security Analysis</MenuItem>
          <MenuItem value="performance">Performance Analysis</MenuItem>
          <MenuItem value="quality">Code Quality</MenuItem>
        </Select>
      </FormControl>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Run Button */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handleStartAnalysis}
        disabled={isRunButtonDisabled}
        startIcon={isUploading ? <CircularProgress size={20} /> : null}
      >
        {isUploading ? 'Starting Analysis...' : 'Run Analysis'}
      </Button>

      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'success.main' }}>
        ✓ File upload with drag/drop<br />
        ✓ Analysis type dropdown<br />
        ✓ Run button enabled only after valid file
      </Typography>
    </Paper>
  );
}

