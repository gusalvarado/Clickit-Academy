/**
 * API utility functions for backend communication
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export interface StartAnalysisRequest {
  file?: File;
  fileContent?: string;
  analysisType: 'security' | 'performance' | 'quality';
}

export interface StartAnalysisResponse {
  threadId: string;
  status: string;
}

export interface StatusResponse {
  status: 'running' | 'completed' | 'error' | 'interrupted';
  node_statuses?: Record<string, {
    status: 'pending' | 'running' | 'completed' | 'failed';
    started_at?: string;
    completed_at?: string | null;
    error?: string | null;
  }>;
  logs?: Array<{
    timestamp: string;
    level: 'info' | 'warn' | 'error' | 'debug';
    message: string;
    node?: string | null;
  }>;
  interrupt_payload?: {
    nodeId: string;
    findings: Array<{
      rule: string;
      severity: 'critical' | 'high' | 'medium' | 'low';
      message: string;
      line?: number | null;
      column?: number | null;
    }>;
    message?: string | null;
  } | null;
  error?: string | null;
}

export interface ResumeRequest {
  threadId: string;
  decision: 'approve' | 'reject';
}

export interface ResumeResponse {
  status: 'running' | 'error';
  message: string;
}

/**
 * Start analysis with file upload
 */
export async function startAnalysis(
  file: File,
  analysisType: 'security' | 'performance' | 'quality'
): Promise<StartAnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('analysisType', analysisType);

  const response = await fetch(`${API_BASE_URL}/api/start-analysis`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to start analysis' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Get workflow status
 */
export async function getStatus(threadId: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE_URL}/api/status?threadId=${encodeURIComponent(threadId)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to fetch status' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Resume workflow after interrupt
 */
export async function resumeWorkflow(
  threadId: string,
  decision: 'approve' | 'reject'
): Promise<ResumeResponse> {
  const response = await fetch(`${API_BASE_URL}/api/resume`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      threadId,
      decision,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to resume workflow' }));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

