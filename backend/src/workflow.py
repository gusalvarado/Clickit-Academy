"""LangGraph workflow definition for security analysis."""
from typing import Literal
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph.message import add_messages
from src.state import WorkflowState, SecurityFinding
from src.eslint_tool import analyze_security
from src.logger import workflow_logger


def file_analysis_node(state: WorkflowState) -> WorkflowState:
    """Node: Analyze file for security issues."""
    thread_id = state["thread_id"]
    workflow_logger.log(thread_id, "info", "Starting file analysis", "file_analysis")
    
    state["current_node"] = "file_analysis"
    
    # Analyze file
    findings = analyze_security(
        state["file_content"],
        state["file_type"],
        thread_id
    )
    
    # Add findings to state
    state["security_findings"] = findings
    
    workflow_logger.log(
        thread_id,
        "info",
        f"Analysis complete. Found {len(findings)} issues",
        "file_analysis"
    )
    
    return state


def approval_check_node(state: WorkflowState) -> WorkflowState:
    """Node: Check if critical findings require human approval."""
    thread_id = state["thread_id"]
    workflow_logger.log(thread_id, "info", "Checking for critical findings", "approval_check")
    
    state["current_node"] = "approval_check"
    
    # Check for critical findings
    critical_findings = [
        f for f in state["security_findings"]
        if f["severity"] in ["critical", "high"]
    ]
    
    if critical_findings:
        state["requires_approval"] = True
        state["status"] = "interrupted"
        workflow_logger.log(
            thread_id,
            "warn",
            f"Found {len(critical_findings)} critical/high severity findings requiring approval",
            "approval_check"
        )
        # Workflow will pause here - status is "interrupted"
        # Resume will be handled via API call
    else:
        state["requires_approval"] = False
        workflow_logger.log(
            thread_id,
            "info",
            "No critical findings, proceeding automatically",
            "approval_check"
        )
    
    return state


def human_approval_node(state: WorkflowState) -> WorkflowState:
    """Node: Handle human approval decision."""
    thread_id = state["thread_id"]
    decision = state.get("approval_decision")
    
    if decision == "approve":
        workflow_logger.log(thread_id, "info", "Human approval granted", "human_approval")
        state["status"] = "running"
        state["requires_approval"] = False
    elif decision == "reject":
        workflow_logger.log(thread_id, "info", "Human approval rejected", "human_approval")
        state["status"] = "error"
        state["error_message"] = "Analysis rejected by human supervisor"
    else:
        # Still waiting for decision
        state["status"] = "interrupted"
    
    return state


def should_require_approval(state: WorkflowState) -> Literal["approval", "complete"]:
    """Conditional edge: Check if approval is required."""
    if state.get("requires_approval", False):
        return "approval"
    return "complete"




def complete_node(state: WorkflowState) -> WorkflowState:
    """Node: Complete workflow."""
    thread_id = state["thread_id"]
    workflow_logger.log(thread_id, "info", "Workflow completed successfully", "complete")
    
    state["current_node"] = "complete"
    state["status"] = "completed"
    
    return state


def build_workflow(checkpointer: MemorySaver):
    """Build and compile the LangGraph workflow."""
    workflow = StateGraph(WorkflowState)
    
    # Add nodes
    workflow.add_node("file_analysis", file_analysis_node)
    workflow.add_node("approval_check", approval_check_node)
    workflow.add_node("human_approval", human_approval_node)
    workflow.add_node("complete", complete_node)
    
    # Set entry point
    workflow.set_entry_point("file_analysis")
    
    # Add edges
    workflow.add_edge("file_analysis", "approval_check")
    # approval_check will interrupt if needed, otherwise continue
    workflow.add_conditional_edges(
        "approval_check",
        should_require_approval,
        {
            "approval": "human_approval",
            "complete": "complete"
        }
    )
    workflow.add_edge("human_approval", "complete")
    workflow.add_edge("complete", END)
    
    # Compile with checkpointer
    return workflow.compile(checkpointer=checkpointer)

