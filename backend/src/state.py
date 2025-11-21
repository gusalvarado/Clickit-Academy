"""LangGraph state definition for security analysis workflow."""
from typing import TypedDict, List, Optional, Literal, Annotated
from langgraph.graph.message import add_messages


class SecurityFinding(TypedDict):
    """Security finding from ESLint or other analysis."""
    rule: str
    severity: Literal["critical", "high", "medium", "low"]
    message: str
    line: Optional[int]
    column: Optional[int]


class WorkflowState(TypedDict):
    """State passed through the LangGraph workflow."""
    # File information
    file_content: str
    file_type: str  # "js", "ts", "py"
    analysis_type: Literal["security", "performance", "quality"]
    
    # Analysis results
    security_findings: Annotated[List[SecurityFinding], add_messages]
    
    # Workflow metadata
    thread_id: str
    current_node: Optional[str]
    
    # Human supervision
    requires_approval: bool
    approval_decision: Optional[Literal["approve", "reject"]]
    
    # Status tracking
    status: Literal["running", "completed", "error", "interrupted"]
    error_message: Optional[str]

