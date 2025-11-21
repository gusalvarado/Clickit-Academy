# Clickit Academy Backend

Backend API for security analysis platform using LangGraph and FastAPI.

## Prerequisites

- Docker and Docker Compose
- (Optional) Python 3.12+ for local development

## Quick Start

### Using Docker Compose (Recommended)

1. **Start the backend stack:**
   ```bash
   docker compose up -d
   ```

2. **Check health:**
   ```bash
   curl http://localhost:8000/health
   ```

3. **Stop the stack:**
   ```bash
   docker compose down
   ```

### Local Development

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js and ESLint:**
   ```bash
   # Install Node.js (if not already installed)
   # Then install ESLint globally
   npm install -g eslint eslint-plugin-security
   ```

3. **Run the server:**
   ```bash
   uvicorn src.main:app --host 0.0.0.0 --port 8000 --reload
   ```

## API Endpoints

All endpoints are prefixed with `/api`:

- `POST /api/start-analysis` - Start a new security analysis
- `GET /api/status?threadId={id}` - Get workflow status
- `POST /api/resume` - Resume interrupted workflow
- `GET /api/report/{threadId}` - Get human-readable analysis report
- `GET /api/report/{threadId}/summary` - Get brief analysis summary
- `GET /health` - Health check

See `docs/api/contracts.md` for detailed API documentation.

## Example Usage

### 1. Start Analysis

```bash
curl -X POST http://localhost:8000/api/start-analysis \
  -F "file=@examples/example.js" \
  -F "analysisType=security"
```

Response:
```json
{
  "threadId": "abc-123-def-456",
  "status": "running"
}
```

### 2. Check Status

```bash
curl "http://localhost:8000/api/status?threadId=abc-123-def-456"
```

Response includes:
- Workflow status (running, completed, interrupted, error)
- Node statuses
- Logs
- Interrupt payload (if interrupted)

### 3. Resume Workflow (if interrupted)

```bash
curl -X POST http://localhost:8000/api/resume \
  -H "Content-Type: application/json" \
  -d '{
    "threadId": "abc-123-def-456",
    "decision": "approve"
  }'
```

### 4. Get Analysis Report

```bash
curl http://localhost:8000/api/report/abc-123-def-456
```

Response includes a markdown-formatted report with all findings, logs, and summary.

### 5. Get Report Summary

```bash
curl http://localhost:8000/api/report/abc-123-def-456/summary
```

Response includes brief statistics about the analysis.

## Project Structure

```
backend/
├── src/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── state.py             # LangGraph state definition
│   ├── workflow.py          # LangGraph workflow
│   ├── workflow_manager.py  # Workflow execution manager
│   ├── eslint_tool.py       # ESLint integration
│   └── logger.py            # Structured logging
├── examples/
│   ├── example.js           # Example JS file with security issues
│   └── example.py           # Example Python file
├── docs/
│   └── api/
│       └── contracts.md     # API contract documentation
├── data/                    # SQLite checkpoints (created at runtime)
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Workflow

The security analysis workflow consists of:

1. **File Analysis** - Run ESLint (for JS/TS) to detect security issues
2. **Approval Check** - Check for critical/high severity findings
3. **Human Approval** (if needed) - Interrupt workflow for human review
4. **Complete** - Finish workflow

## State Persistence

Workflow state is persisted using LangGraph's SQLite checkpointer:
- Database: `data/checkpoints.db` (created automatically)
- Survives server restarts
- Queryable by `threadId`

## Logging

Structured logging is provided:
- In-memory logs accessible via `/api/status`
- JSON-formatted logs to stdout
- Includes timestamps, levels, messages, and node information

## Testing

### Manual Test Plan

1. **Non-critical file test:**
   - Upload a file with only low/medium severity issues
   - Should complete automatically without interruption

2. **Critical file test:**
   - Upload `examples/example.js` (contains critical issues)
   - Should trigger interrupt for human approval
   - Test both "approve" and "reject" decisions

3. **Error handling:**
   - Test with invalid file types
   - Test with missing threadId
   - Test resume on non-interrupted workflow

### Example Test Run

```bash
# Start analysis
THREAD_ID=$(curl -s -X POST http://localhost:8000/api/start-analysis \
  -F "file=@examples/example.js" \
  -F "analysisType=security" | jq -r '.threadId')

# Poll status (should show interrupted)
curl "http://localhost:8000/api/status?threadId=$THREAD_ID" | jq

# Resume with approval
curl -X POST http://localhost:8000/api/resume \
  -H "Content-Type: application/json" \
  -d "{\"threadId\": \"$THREAD_ID\", \"decision\": \"approve\"}"

# Check final status
curl "http://localhost:8000/api/status?threadId=$THREAD_ID" | jq
```

## Development

### Adding New Analysis Types

1. Extend `eslint_tool.py` or create new analysis tools
2. Update workflow nodes in `workflow.py`
3. Add new file type support in `main.py`

### Debugging

- Check logs: `docker compose logs -f backend`
- Access container: `docker compose exec backend bash`
- View checkpoints: SQLite database at `data/checkpoints.db`

## Troubleshooting

### ESLint not found
- Ensure Node.js is installed in container
- Check that ESLint is installed: `npm list -g eslint`

### Workflow not interrupting
- Check that critical findings are detected
- Verify interrupt is called in `approval_check_node`
- Check logs for errors

### State not persisting
- Ensure `data/` directory is writable
- Check Docker volume mounts in `docker-compose.yml`

## License

This project is for learning purposes.

