# Clickit Academy - Security Analysis Platform

A full-stack application for automated security analysis of code files using LangGraph agents with human-in-the-loop supervision.

## Project Overview

This project implements a security analysis platform that:
- Accepts code files (JavaScript, TypeScript, Python) for analysis
- Runs automated security scans using ESLint and LangGraph agents
- Provides real-time workflow visualization and logging
- Supports human supervision for critical security findings
- Manages workflow state with checkpointing and resume capabilities

## Frontend Implementation

### Status: ✅ Complete

The frontend has been fully implemented with all required features:

#### Technology Stack
- **React 19** with TypeScript
- **Vite** for build tooling
- **Material-UI (MUI) v7** for UI components
- **Zustand** for state management with persistence
- **react-dropzone** for file uploads

#### Implemented Features

1. **State Management (Task 02)**
   - `UiStatus` enum: IDLE, RUNNING, COMPLETED, ERROR, INTERRUPTED
   - `WorkflowState` model with threadId, nodeStatuses, logs, interruptPayload
   - Zustand store with localStorage persistence
   - State persists across page reloads

2. **File Selector & Config Panel (Task 03)**
   - Drag & drop file upload interface
   - File type validation (.js, .jsx, .ts, .tsx, .py)
   - Analysis type dropdown (Security, Performance, Quality)
   - Run button enabled only after valid file selection

3. **Workflow Visualization (Task 04)**
   - MUI Stepper component showing workflow progress
   - Live node status updates (pending, running, completed, failed)
   - Visual indicators with color coding
   - Node timestamps and error messages

4. **Logs Panel (Task 05)**
   - Scrollable log viewer with timestamps
   - Auto-scroll to bottom on new logs
   - Filter by log level (All, Info, Warn, Error, Debug)
   - Chronological display with node information

5. **Human Supervision UI (Task 06)**
   - Modal dialog triggered by interrupt payloads
   - Displays critical security findings with severity
   - Approve/Reject buttons with API integration points
   - Severity-based color coding (critical, high, medium, low)

6. **Status Polling Runner (Task 07)**
   - Custom hook `useStatusPolling` for backend polling
   - Polls every 2 seconds when workflow is RUNNING
   - Automatic cleanup on unmount or status change
   - No memory leaks (proper useEffect cleanup)

7. **Global Error Handling (Task 08)**
   - React Error Boundary component for crash recovery
   - MUI Snackbar for user-facing errors
   - Retry functionality for transient errors
   - Graceful error display with stack traces

### Frontend Setup

```bash
cd frontend
npm install
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

The frontend runs on `http://localhost:5173` by default (Vite dev server).

### Frontend Project Structure

```
frontend/
├── src/
│   ├── components/          # React components
│   │   ├── ErrorBoundary.tsx
│   │   ├── ErrorSnackbar.tsx
│   │   ├── FileSelector.tsx
│   │   ├── HumanSupervisionModal.tsx
│   │   ├── LogsPanel.tsx
│   │   ├── StatusPollingProvider.tsx
│   │   ├── WorkflowVisualization.tsx
│   │   └── StateTest.tsx
│   ├── hooks/
│   │   └── useStatusPolling.ts    # Polling hook
│   ├── store/
│   │   └── workflowStore.ts        # Zustand store
│   ├── types/
│   │   └── workflow.ts           # TypeScript types
│   ├── App.tsx
│   └── main.tsx
└── package.json
```

## Backend Considerations

### Required API Endpoints

The frontend expects the following backend endpoints to be implemented:

#### 1. Start Analysis
```
POST /api/start-analysis
Content-Type: application/json

Request:
{
  "file": File (multipart/form-data) OR
  "fileContent": string,
  "analysisType": "security" | "performance" | "quality"
}

Response:
{
  "threadId": string,
  "status": "running"
}
```

#### 2. Get Status
```
GET /api/status?threadId={threadId}

Response:
{
  "status": "running" | "completed" | "error" | "interrupted",
  "node_statuses": {
    "nodeId": {
      "status": "pending" | "running" | "completed" | "failed",
      "started_at": "ISO8601 timestamp",
      "completed_at": "ISO8601 timestamp" | null,
      "error": string | null
    }
  },
  "logs": [
    {
      "timestamp": "ISO8601 timestamp",
      "level": "info" | "warn" | "error" | "debug",
      "message": string,
      "node": string | null
    }
  ],
  "interrupt_payload": {
    "nodeId": string,
    "findings": [
      {
        "rule": string,
        "severity": "critical" | "high" | "medium" | "low",
        "message": string,
        "line": number | null,
        "column": number | null
      }
    ],
    "message": string | null
  } | null,
  "error": string | null
}
```

#### 3. Resume Workflow
```
POST /api/resume
Content-Type: application/json

Request:
{
  "threadId": string,
  "decision": "approve" | "reject"
}

Response:
{
  "status": "running" | "error",
  "message": string
}
```

### Backend Integration Points

The frontend has placeholder API calls marked with `TODO` comments in:
- `src/components/FileSelector.tsx` - Start analysis endpoint
- `src/hooks/useStatusPolling.ts` - Status polling endpoint
- `src/components/HumanSupervisionModal.tsx` - Resume endpoint

### Backend Requirements

1. **CORS Configuration**
   - Backend must allow CORS from frontend origin (typically `http://localhost:5173` in development)
   - Include credentials if authentication is added

2. **Response Format**
   - All endpoints should return JSON
   - Use consistent error format: `{ "error": "error message" }`
   - Status codes: 200 (success), 400 (bad request), 500 (server error)

3. **Polling Strategy**
   - Frontend polls `/api/status` every 2 seconds when workflow is RUNNING
   - Backend should handle concurrent requests efficiently
   - Consider rate limiting if needed

4. **Interrupt Handling**
   - When LangGraph calls `interrupt()`, backend should:
     - Set status to "interrupted" in `/api/status` response
     - Include `interrupt_payload` with findings
     - Wait for `/api/resume` call before continuing

5. **State Persistence**
   - Backend should persist workflow state (threadId, node statuses, logs)
   - Use checkpointing mechanism (e.g., SQLite with LangGraph SqliteSaver)
   - State should survive server restarts

### Backend Task Status

See `issues/` directory for backend implementation tasks:
- `01_backend_api_contracts.md` - API contract definition
- `01_backend_dockerize_backend.md` - Docker setup
- `02_backend_docker_compose_local_stack.md` - Docker Compose configuration
- `03_backend_langgraph_agent_api.md` - LangGraph API implementation
- `04_backend_eslint_local_integration.md` - ESLint integration
- `05_backend_interrupt_checkpoint_handling.md` - Interrupt handling
- `06_backend_example_files_service.md` - Example files service
- `07_backend_structured_logging_and_reports.md` - Logging and reports
- `08_backend_local_env_bootstrap_docs.md` - Local setup documentation
- `09_backend_ci_local_validation.md` - CI validation

## Development Workflow

1. **Frontend Development**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on `http://localhost:5173`

2. **Backend Development** (when implemented)
   ```bash
   cd backend
   # Follow backend setup instructions
   ```

3. **Integration Testing**
   - Start backend server
   - Start frontend dev server
   - Test file upload and analysis workflow
   - Verify polling and interrupt handling

## Architecture

### Frontend Architecture

```
┌─────────────────────────────────────────┐
│         React Application               │
│  ┌───────────────────────────────────┐  │
│  │      Zustand Store (State)        │  │
│  │  - WorkflowState                  │  │
│  │  - Persisted to localStorage      │  │
│  └───────────────────────────────────┘  │
│           │                              │
│  ┌────────┴────────┐                    │
│  │                 │                    │
│  │  Components     │  Hooks             │
│  │  - FileSelector │  - useStatusPolling│
│  │  - WorkflowViz  │                    │
│  │  - LogsPanel    │                    │
│  │  - HumanModal   │                    │
│  └────────┬────────┘                    │
│           │                              │
│  ┌────────▼────────┐                    │
│  │   API Calls      │                    │
│  │   (TODO: Backend)│                    │
│  └──────────────────┘                    │
└─────────────────────────────────────────┘
```

### State Flow

1. User uploads file → `FileSelector` → Store `threadId` → Set status to RUNNING
2. `useStatusPolling` hook polls `/api/status` every 2 seconds
3. Backend updates node statuses and logs → Store updates → UI re-renders
4. If interrupt occurs → Store `interruptPayload` → Show `HumanSupervisionModal`
5. User approves/rejects → Call `/api/resume` → Continue workflow

## Testing

### Frontend Testing
- All components compile successfully with TypeScript strict mode
- State management validated with test component
- Build passes: `npm run build`

### Integration Testing (Pending Backend)
- File upload and analysis workflow
- Status polling and updates
- Interrupt handling and resume
- Error handling and recovery

## Next Steps

1. **Backend Implementation**
   - Implement API endpoints as specified
   - Set up LangGraph agent with interrupt support
   - Integrate ESLint security scanning
   - Configure Docker and Docker Compose

2. **Integration**
   - Replace TODO comments in frontend with actual API calls
   - Test end-to-end workflow
   - Handle CORS and authentication if needed

3. **Enhancements**
   - Add authentication/authorization
   - Implement file storage
   - Add report generation and download
   - Improve error messages and user feedback

## License

This project is for learning purposes.
