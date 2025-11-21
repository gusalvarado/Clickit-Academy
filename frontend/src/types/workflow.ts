/**
 * UI Status type representing the current state of the workflow UI
 */
export const UiStatus = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  ERROR: 'error',
  INTERRUPTED: 'interrupted',
} as const;

export type UiStatus = typeof UiStatus[keyof typeof UiStatus];

/**
 * Node status in the workflow
 */
export const NodeStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
  SKIPPED: 'skipped',
} as const;

export type NodeStatus = typeof NodeStatus[keyof typeof NodeStatus];

/**
 * Log entry structure
 */
export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  node?: string;
}

/**
 * Node status information
 */
export interface NodeStatusInfo {
  nodeId: string;
  status: NodeStatus;
  startedAt?: string;
  completedAt?: string;
  error?: string;
}

/**
 * Interrupt payload from LangGraph
 */
export interface InterruptPayload {
  nodeId: string;
  findings: SecurityFinding[];
  message?: string;
}

/**
 * Security finding structure
 */
export interface SecurityFinding {
  rule: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  line?: number;
  column?: number;
}

/**
 * Workflow state structure
 */
export interface WorkflowState {
  threadId: string | null;
  uiStatus: UiStatus;
  nodeStatuses: Record<string, NodeStatusInfo>;
  logs: LogEntry[];
  interruptPayload: InterruptPayload | null;
  error: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

