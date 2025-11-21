# API Contracts

This document defines all backend API endpoints required by the frontend application.

## Base URL

All endpoints are prefixed with `/api`:
- Development: `http://localhost:8000/api`
- Production: TBD

## Endpoints

### 1. Start Analysis

Initiates a new security analysis workflow for an uploaded file.

**Endpoint:** `POST /api/start-analysis`

**Content-Type:** `multipart/form-data` or `application/json`

**Request Body (multipart/form-data):**
```
file: File (required)
analysisType: "security" | "performance" | "quality" (required)
```

**Request Body (application/json):**
```json
{
  "fileContent": "string (base64 encoded or plain text)",
  "analysisType": "security" | "performance" | "quality"
}
```

**Response (200 OK):**
```json
{
  "threadId": "string (UUID or unique identifier)",
  "status": "running"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid file type or missing required fields
  ```json
  {
    "error": "Invalid file type. Supported types: .js, .jsx, .ts, .tsx, .py"
  }
  ```
- `500 Internal Server Error`: Server error during analysis initiation
  ```json
  {
    "error": "Failed to start analysis"
  }
  ```

---

### 2. Get Status

Retrieves the current status of a workflow execution, including node statuses, logs, and interrupt payload if present.

**Endpoint:** `GET /api/status`

**Query Parameters:**
- `threadId` (required): The thread ID returned from `/api/start-analysis`

**Example:** `GET /api/status?threadId=abc123`

**Response (200 OK):**
```json
{
  "status": "running" | "completed" | "error" | "interrupted",
  "node_statuses": {
    "nodeId": {
      "status": "pending" | "running" | "completed" | "failed",
      "started_at": "2024-01-01T12:00:00Z" | null,
      "completed_at": "2024-01-01T12:05:00Z" | null,
      "error": "string | null"
    }
  },
  "logs": [
    {
      "timestamp": "2024-01-01T12:00:00Z",
      "level": "info" | "warn" | "error" | "debug",
      "message": "string",
      "node": "string | null"
    }
  ],
  "interrupt_payload": {
    "nodeId": "string",
    "findings": [
      {
        "rule": "string",
        "severity": "critical" | "high" | "medium" | "low",
        "message": "string",
        "line": 42 | null,
        "column": 10 | null
      }
    ],
    "message": "string | null"
  } | null,
  "error": "string | null"
}
```

**Error Responses:**
- `400 Bad Request`: Missing or invalid threadId
  ```json
  {
    "error": "threadId is required"
  }
  ```
- `404 Not Found`: Thread ID not found
  ```json
  {
    "error": "Thread not found"
  }
  ```
- `500 Internal Server Error`: Server error retrieving status
  ```json
  {
    "error": "Failed to retrieve status"
  }
  ```

**Notes:**
- Frontend polls this endpoint every 2 seconds when status is "running"
- When status is "interrupted", `interrupt_payload` will contain the findings requiring human approval
- `node_statuses` object keys are node identifiers from the LangGraph workflow
- Logs array is chronological, with most recent entries appended

---

### 3. Resume Workflow

Resumes a workflow that has been interrupted for human supervision.

**Endpoint:** `POST /api/resume`

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "threadId": "string (required)",
  "decision": "approve" | "reject"
}
```

**Response (200 OK):**
```json
{
  "status": "running" | "error",
  "message": "Workflow resumed successfully" | "Workflow rejected and terminated"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid decision value
  ```json
  {
    "error": "threadId and decision are required. decision must be 'approve' or 'reject'"
  }
  ```
- `404 Not Found`: Thread ID not found or not in interrupted state
  ```json
  {
    "error": "Thread not found or not in interrupted state"
  }
  ```
- `409 Conflict`: Workflow is not in an interruptible state
  ```json
  {
    "error": "Workflow is not currently interrupted"
  }
  ```
- `500 Internal Server Error`: Server error resuming workflow
  ```json
  {
    "error": "Failed to resume workflow"
  }
  ```

**Notes:**
- This endpoint should only be called when the workflow status is "interrupted"
- "approve" decision continues the workflow execution
- "reject" decision terminates the workflow and sets status to "error" or "completed" with appropriate error message

---

### 4. Get Report

Retrieves a human-readable security analysis report for a completed or in-progress workflow.

**Endpoint:** `GET /api/report/{threadId}`

**Path Parameters:**
- `threadId` (required): The thread ID returned from `/api/start-analysis`

**Response (200 OK):**
```json
{
  "threadId": "string",
  "report": "string (markdown formatted)",
  "format": "markdown"
}
```

**Error Responses:**
- `400 Bad Request`: Missing threadId
- `404 Not Found`: Thread ID not found

**Notes:**
- Report includes summary, all security findings grouped by severity, execution logs, and human review decisions
- Report is formatted in Markdown for easy rendering

---

### 5. Get Report Summary

Retrieves a brief summary of analysis results with statistics.

**Endpoint:** `GET /api/report/{threadId}/summary`

**Path Parameters:**
- `threadId` (required): The thread ID returned from `/api/start-analysis`

**Response (200 OK):**
```json
{
  "thread_id": "string",
  "status": "running" | "completed" | "error" | "interrupted",
  "total_findings": 5,
  "critical_findings": 2,
  "high_findings": 1,
  "medium_findings": 1,
  "low_findings": 1,
  "requires_approval": true,
  "log_count": 15,
  "error": "string | null"
}
```

**Error Responses:**
- `400 Bad Request`: Missing threadId
- `404 Not Found`: Thread ID not found

---

## Polling Strategy

The frontend uses a **polling strategy** (not WebSockets) for status updates:

- Polling interval: **2 seconds**
- Polling occurs when workflow status is `"running"` or `"interrupted"`
- Polling stops when status is `"completed"`, `"error"`, or component unmounts
- Backend should handle concurrent polling requests efficiently
- Consider implementing rate limiting if needed

---

## CORS Configuration

The backend must allow CORS from the frontend origin:

- **Development:** `http://localhost:5173` (Vite dev server default)
- **Production:** TBD

CORS headers should include:
- `Access-Control-Allow-Origin: <frontend-origin>`
- `Access-Control-Allow-Methods: GET, POST, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type`
- Include credentials if authentication is added later

---

## State Persistence

- Workflow state (threadId, node statuses, logs) must persist across server restarts
- Use LangGraph `SqliteSaver` with a mounted Docker volume for checkpoint persistence
- State should be queryable by `threadId` for status retrieval

---

## Error Format

All error responses follow this consistent format:

```json
{
  "error": "Human-readable error message"
}
```

HTTP status codes:
- `200`: Success
- `400`: Bad Request (client error)
- `404`: Not Found
- `409`: Conflict (e.g., workflow not in expected state)
- `500`: Internal Server Error (server error)

---

## Example Workflow

1. **Start Analysis:**
   ```bash
   curl -X POST http://localhost:8000/api/start-analysis \
     -F "file=@example.js" \
     -F "analysisType=security"
   ```
   Response: `{"threadId": "abc123", "status": "running"}`

2. **Poll Status (every 2 seconds):**
   ```bash
   curl http://localhost:8000/api/status?threadId=abc123
   ```
   Response includes node statuses and logs as workflow progresses

3. **If Interrupted:**
   - Status response includes `interrupt_payload` with findings
   - Frontend displays human supervision modal

4. **Resume Workflow:**
   ```bash
   curl -X POST http://localhost:8000/api/resume \
     -H "Content-Type: application/json" \
     -d '{"threadId": "abc123", "decision": "approve"}'
   ```
   Response: `{"status": "running", "message": "Workflow resumed successfully"}`

5. **Continue Polling:**
   - Status polling continues until workflow completes or errors

