"""FastAPI application for security analysis backend."""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import os
from src.models import (
    StartAnalysisRequest,
    StartAnalysisResponse,
    StatusResponse,
    ResumeRequest,
    ResumeResponse
)
from src.workflow_manager import workflow_manager
from src.logger import workflow_logger
from src.report_generator import generate_report, get_report_summary

app = FastAPI(title="Clickit Academy Security Analysis API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:3000",  # Alternative frontend port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_file_type(filename: str) -> str:
    """Extract file type from filename."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext


@app.post("/api/start-analysis", response_model=StartAnalysisResponse)
async def start_analysis(
    file: Optional[UploadFile] = File(None),
    fileContent: Optional[str] = Form(None),
    analysisType: str = Form(...)
):
    """
    Start a new security analysis workflow.
    
    Accepts either:
    - multipart/form-data with file upload
    - application/json with fileContent string
    """
    try:
        # Get file content
        if file:
            content = await file.read()
            file_content = content.decode("utf-8")
            file_type = get_file_type(file.filename)
        elif fileContent:
            file_content = fileContent
            # Try to infer file type from content or default to js
            file_type = "js"  # Default, could be enhanced
        else:
            raise HTTPException(
                status_code=400,
                detail="Either 'file' or 'fileContent' must be provided"
            )
        
        # Validate file type
        valid_types = ["js", "jsx", "ts", "tsx", "py"]
        if file_type not in valid_types:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Supported types: {', '.join(valid_types)}"
            )
        
        # Validate analysis type
        if analysisType not in ["security", "performance", "quality"]:
            raise HTTPException(
                status_code=400,
                detail="analysisType must be one of: security, performance, quality"
            )
        
        # Start workflow
        thread_id = workflow_manager.start_analysis(
            file_content=file_content,
            file_type=file_type,
            analysis_type=analysisType
        )
        
        return StartAnalysisResponse(threadId=thread_id, status="running")
        
    except HTTPException:
        raise
    except Exception as e:
        workflow_logger.log("system", "error", f"Start analysis error: {str(e)}", "api")
        raise HTTPException(status_code=500, detail="Failed to start analysis")


@app.get("/api/status", response_model=StatusResponse)
async def get_status(threadId: str = Query(..., description="Thread identifier")):
    """
    Get the current status of a workflow execution.
    """
    if not threadId:
        raise HTTPException(status_code=400, detail="threadId is required")
    
    status_data = workflow_manager.get_status(threadId)
    
    if status_data is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    return StatusResponse(**status_data)


@app.post("/api/resume", response_model=ResumeResponse)
async def resume_workflow(request: ResumeRequest):
    """
    Resume an interrupted workflow with human decision.
    """
    if not request.threadId:
        raise HTTPException(status_code=400, detail="threadId is required")
    
    if request.decision not in ["approve", "reject"]:
        raise HTTPException(
            status_code=400,
            detail="decision must be 'approve' or 'reject'"
        )
    
    # Check if thread exists and is in interrupted state
    status_data = workflow_manager.get_status(request.threadId)
    if status_data is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    if status_data.get("status") != "interrupted":
        raise HTTPException(
            status_code=409,
            detail="Workflow is not currently interrupted"
        )
    
    # Resume workflow
    success = workflow_manager.resume_workflow(request.threadId, request.decision)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to resume workflow")
    
    if request.decision == "approve":
        return ResumeResponse(
            status="running",
            message="Workflow resumed successfully"
        )
    else:
        return ResumeResponse(
            status="error",
            message="Workflow rejected and terminated"
        )


@app.get("/api/report/{threadId}")
async def get_report(threadId: str):
    """
    Get a human-readable security analysis report for a completed workflow.
    """
    if not threadId:
        raise HTTPException(status_code=400, detail="threadId is required")
    
    status_data = workflow_manager.get_status(threadId)
    
    if status_data is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    # Generate report
    report = generate_report(threadId, status_data)
    
    return {
        "threadId": threadId,
        "report": report,
        "format": "markdown"
    }


@app.get("/api/report/{threadId}/summary")
async def get_report_summary_endpoint(threadId: str):
    """
    Get a brief summary of the analysis results.
    """
    if not threadId:
        raise HTTPException(status_code=400, detail="threadId is required")
    
    status_data = workflow_manager.get_status(threadId)
    
    if status_data is None:
        raise HTTPException(status_code=404, detail="Thread not found")
    
    summary = get_report_summary(threadId, status_data)
    
    return summary


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

