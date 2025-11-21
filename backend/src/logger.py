"""Structured logging for workflow execution."""
import logging
import json
from datetime import datetime
from typing import Optional, Dict, List
from pythonjsonlogger import jsonlogger


class WorkflowLogger:
    """Logger that stores logs in memory for API retrieval."""
    
    def __init__(self):
        self.logs: Dict[str, List[Dict]] = {}  # thread_id -> list of logs
        self._setup_logger()
    
    def _setup_logger(self):
        """Set up Python logging with JSON formatter."""
        logHandler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
        logHandler.setFormatter(formatter)
        
        self.logger = logging.getLogger('workflow')
        self.logger.setLevel(logging.INFO)
        self.logger.addHandler(logHandler)
    
    def log(
        self,
        thread_id: str,
        level: str,
        message: str,
        node: Optional[str] = None
    ):
        """Log a message for a specific thread."""
        log_entry = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "level": level,
            "message": message,
            "node": node
        }
        
        if thread_id not in self.logs:
            self.logs[thread_id] = []
        
        self.logs[thread_id].append(log_entry)
        
        # Also log to standard logger
        log_method = getattr(self.logger, level.lower(), self.logger.info)
        log_method(f"[{thread_id}] [{node or 'system'}] {message}")
    
    def get_logs(self, thread_id: str) -> List[Dict]:
        """Get all logs for a thread."""
        return self.logs.get(thread_id, [])
    
    def clear_logs(self, thread_id: str):
        """Clear logs for a thread (optional cleanup)."""
        if thread_id in self.logs:
            del self.logs[thread_id]


# Global logger instance
workflow_logger = WorkflowLogger()

