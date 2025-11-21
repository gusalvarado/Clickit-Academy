"""Data models for API requests and responses."""
from typing import Dict, List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime


class StartAnalysisRequest(BaseModel):
    """Request model for starting analysis."""
    fileContent: Optional[str] = Field(None, description="File content as string")
    analysisType: Literal["security", "performance", "quality"] = Field(
        ..., description="Type of analysis to perform"
    )


class StartAnalysisResponse(BaseModel):
    """Response model for starting analysis."""
    threadId: str = Field(..., description="Unique thread identifier")
    status: Literal["running"] = Field(..., description="Initial workflow status")


class NodeStatus(BaseModel):
    """Status of a workflow node."""
    status: Literal["pending", "running", "completed", "failed"]
    started_at: Optional[str] = Field(None, description="ISO8601 timestamp")
    completed_at: Optional[str] = Field(None, description="ISO8601 timestamp")
    error: Optional[str] = Field(None, description="Error message if failed")


class LogEntry(BaseModel):
    """Log entry from workflow execution."""
    timestamp: str = Field(..., description="ISO8601 timestamp")
    level: Literal["info", "warn", "error", "debug"]
    message: str
    node: Optional[str] = Field(None, description="Node identifier")


class SecurityFinding(BaseModel):
    """Security finding from analysis."""
    rule: str
    severity: Literal["critical", "high", "medium", "low"]
    message: str
    line: Optional[int] = None
    column: Optional[int] = None


class InterruptPayload(BaseModel):
    """Payload when workflow is interrupted for human supervision."""
    nodeId: str
    findings: List[SecurityFinding]
    message: Optional[str] = None


class StatusResponse(BaseModel):
    """Response model for workflow status."""
    status: Literal["running", "completed", "error", "interrupted"]
    node_statuses: Dict[str, NodeStatus] = Field(default_factory=dict)
    logs: List[LogEntry] = Field(default_factory=list)
    interrupt_payload: Optional[InterruptPayload] = None
    error: Optional[str] = None


class ResumeRequest(BaseModel):
    """Request model for resuming workflow."""
    threadId: str = Field(..., description="Thread identifier")
    decision: Literal["approve", "reject"] = Field(..., description="Human decision")


class ResumeResponse(BaseModel):
    """Response model for resuming workflow."""
    status: Literal["running", "error"]
    message: str

