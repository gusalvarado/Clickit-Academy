import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UiStatus } from '../types/workflow';
import type { WorkflowState, NodeStatusInfo, LogEntry, InterruptPayload } from '../types/workflow';

interface WorkflowStore extends WorkflowState {
  // Actions
  setThreadId: (threadId: string | null) => void;
  setUiStatus: (status: UiStatus) => void;
  updateNodeStatus: (nodeId: string, statusInfo: Partial<NodeStatusInfo>) => void;
  addLog: (log: LogEntry) => void;
  setLogs: (logs: LogEntry[]) => void;
  setInterruptPayload: (payload: InterruptPayload | null) => void;
  setError: (error: string | null) => void;
  setStartedAt: (timestamp: string | null) => void;
  setCompletedAt: (timestamp: string | null) => void;
  reset: () => void;
}

const initialState: WorkflowState = {
  threadId: null,
  uiStatus: UiStatus.IDLE,
  nodeStatuses: {},
  logs: [],
  interruptPayload: null,
  error: null,
  startedAt: null,
  completedAt: null,
};

export const useWorkflowStore = create<WorkflowStore>()(
  persist(
    (set) => ({
      ...initialState,

      setThreadId: (threadId) => set({ threadId }),

      setUiStatus: (status) => set({ uiStatus: status }),

      updateNodeStatus: (nodeId, statusInfo) =>
        set((state) => ({
          nodeStatuses: {
            ...state.nodeStatuses,
            [nodeId]: {
              ...state.nodeStatuses[nodeId],
              nodeId,
              ...statusInfo,
            },
          },
        })),

      addLog: (log) =>
        set((state) => ({
          logs: [...state.logs, log],
        })),

      setLogs: (logs) => set({ logs }),

      setInterruptPayload: (payload) => set({ interruptPayload: payload }),

      setError: (error) => set({ error }),

      setStartedAt: (timestamp) => set({ startedAt: timestamp }),

      setCompletedAt: (timestamp) => set({ completedAt: timestamp }),

      reset: () => set(initialState),
    }),
    {
      name: 'workflow-storage', // localStorage key
      partialize: (state) => ({
        threadId: state.threadId,
        uiStatus: state.uiStatus,
        nodeStatuses: state.nodeStatuses,
        logs: state.logs,
        interruptPayload: state.interruptPayload,
        error: state.error,
        startedAt: state.startedAt,
        completedAt: state.completedAt,
      }),
    }
  )
);

