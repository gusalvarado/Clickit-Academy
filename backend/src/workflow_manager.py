"""Manages workflow execution and state tracking."""
import uuid
import threading
from typing import Dict, Optional
# Use MemorySaver for now - can be upgraded to SqliteSaver later
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import StateGraph
from src.workflow import build_workflow
from src.state import WorkflowState
from src.logger import workflow_logger


class WorkflowManager:
    """Manages multiple workflow executions."""
    
    def __init__(self, db_path: str = "data/checkpoints.db"):
        """Initialize workflow manager with Memory checkpointer."""
        # Using MemorySaver for now - state persists during runtime
        # TODO: Upgrade to SqliteSaver for persistence across restarts
        self.checkpointer = MemorySaver()
        
        self.graph = build_workflow(self.checkpointer)
        self.node_statuses: Dict[str, Dict[str, Dict]] = {}  # thread_id -> node_id -> status
    
    def start_analysis(
        self,
        file_content: str,
        file_type: str,
        analysis_type: str
    ) -> str:
        """
        Start a new analysis workflow.
        
        Returns:
            thread_id: Unique identifier for this workflow
        """
        thread_id = str(uuid.uuid4())
        
        # Initialize state
        initial_state: WorkflowState = {
            "file_content": file_content,
            "file_type": file_type,
            "analysis_type": analysis_type,
            "security_findings": [],
            "thread_id": thread_id,
            "current_node": None,
            "requires_approval": False,
            "approval_decision": None,
            "status": "running",
            "error_message": None
        }
        
        # Initialize node statuses
        self.node_statuses[thread_id] = {}
        
        # Create config for this thread
        config = {"configurable": {"thread_id": thread_id}}
        
        # Invoke workflow in background thread
        try:
            workflow_logger.log(thread_id, "info", "Workflow started", "system")
            
            def run_workflow():
                try:
                    # Run workflow - check for interrupts after each step
                    for event in self.graph.stream(initial_state, config):
                        # Update node statuses as workflow progresses
                        for node_name, node_output in event.items():
                            if thread_id not in self.node_statuses:
                                self.node_statuses[thread_id] = {}
                            
                            # Mark node as running
                            if node_name not in self.node_statuses[thread_id]:
                                self.node_statuses[thread_id][node_name] = {
                                    "status": "running",
                                    "started_at": None,
                                    "completed_at": None,
                                    "error": None
                                }
                            
                            # Check if workflow is interrupted
                            state = self.graph.get_state(config)
                            if state.values and state.values.get("status") == "interrupted":
                                # Workflow paused for human approval
                                self.node_statuses[thread_id][node_name]["status"] = "completed"
                                return  # Exit and wait for resume
                            
                            # Mark node as completed
                            self.node_statuses[thread_id][node_name]["status"] = "completed"
                            
                except Exception as e:
                    workflow_logger.log(thread_id, "error", f"Workflow execution error: {str(e)}", "system")
                    state = self.graph.get_state(config)
                    if state.values:
                        state.values["status"] = "error"
                        state.values["error_message"] = str(e)
            
            # Start workflow in background thread
            thread = threading.Thread(target=run_workflow, daemon=True)
            thread.start()
            
        except Exception as e:
            workflow_logger.log(thread_id, "error", f"Workflow start failed: {str(e)}", "system")
            raise
        
        return thread_id
    
    def get_status(self, thread_id: str) -> Optional[Dict]:
        """
        Get current status of a workflow.
        
        Returns:
            Status dictionary or None if thread not found
        """
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            # Get current state from checkpointer
            state = self.graph.get_state(config)
            
            if state.values is None:
                return None
            
            # Get all findings from state
            all_findings = state.values.get("security_findings", [])
            
            # Build status response
            status_data = {
                "status": state.values.get("status", "running"),
                "node_statuses": self.node_statuses.get(thread_id, {}),
                "logs": workflow_logger.get_logs(thread_id),
                "interrupt_payload": None,
                "error": state.values.get("error_message"),
                "all_findings": all_findings  # Include all findings for report generation
            }
            
            # Build interrupt payload if interrupted
            if state.values.get("status") == "interrupted":
                critical_findings = [
                    f for f in all_findings
                    if f.get("severity") in ["critical", "high"]
                ]
                
                if critical_findings:
                    status_data["interrupt_payload"] = {
                        "nodeId": state.values.get("current_node", "approval_check"),
                        "findings": critical_findings,
                        "message": f"Found {len(critical_findings)} critical/high severity security issues"
                    }
            
            return status_data
            
        except Exception as e:
            workflow_logger.log(thread_id, "error", f"Failed to get status: {str(e)}", "system")
            return None
    
    def resume_workflow(self, thread_id: str, decision: str) -> bool:
        """
        Resume an interrupted workflow with human decision.
        
        Args:
            thread_id: Thread identifier
            decision: "approve" or "reject"
        
        Returns:
            True if successful, False otherwise
        """
        config = {"configurable": {"thread_id": thread_id}}
        
        try:
            # Get current state
            state = self.graph.get_state(config)
            
            if state.values is None:
                return False
            
            if state.values.get("status") != "interrupted":
                return False
            
            # Update state with decision using Command
            updated_state = dict(state.values)
            updated_state["approval_decision"] = decision
            
            # Resume workflow by updating state and continuing
            def continue_workflow():
                try:
                    # Update state with decision
                    self.graph.update_state(config, updated_state)
                    
                    # Continue execution from where it left off
                    for event in self.graph.stream(None, config):
                        # Update node statuses
                        for node_name, node_output in event.items():
                            if thread_id not in self.node_statuses:
                                self.node_statuses[thread_id] = {}
                            if node_name not in self.node_statuses[thread_id]:
                                self.node_statuses[thread_id][node_name] = {
                                    "status": "running",
                                    "started_at": None,
                                    "completed_at": None,
                                    "error": None
                                }
                            self.node_statuses[thread_id][node_name]["status"] = "completed"
                            
                except Exception as e:
                    workflow_logger.log(thread_id, "error", f"Resume execution error: {str(e)}", "system")
            
            # Continue in background thread
            thread = threading.Thread(target=continue_workflow, daemon=True)
            thread.start()
            
            workflow_logger.log(
                thread_id,
                "info",
                f"Workflow resumed with decision: {decision}",
                "system"
            )
            
            return True
            
        except Exception as e:
            workflow_logger.log(thread_id, "error", f"Failed to resume workflow: {str(e)}", "system")
            return False


# Global workflow manager instance
workflow_manager = WorkflowManager()

