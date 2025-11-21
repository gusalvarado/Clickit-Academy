"""ESLint integration as a LangGraph tool."""
import subprocess
import json
import tempfile
import os
from typing import List, Dict
from src.state import SecurityFinding
from src.logger import workflow_logger


def run_eslint(file_content: str, file_type: str, thread_id: str) -> List[SecurityFinding]:
    """
    Run ESLint on JavaScript/TypeScript file content.
    
    Args:
        file_content: Source code content
        file_type: File extension (js, jsx, ts, tsx)
        thread_id: Thread ID for logging
    
    Returns:
        List of security findings
    """
    # Only run ESLint for JS/TS files
    if file_type not in ["js", "jsx", "ts", "tsx"]:
        workflow_logger.log(
            thread_id,
            "info",
            f"ESLint skipped for file type: {file_type}",
            "eslint_tool"
        )
        return []
    
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix=f'.{file_type}',
            delete=False
        ) as tmp_file:
            tmp_file.write(file_content)
            tmp_path = tmp_file.name
        
        try:
            # Run ESLint with security plugin
            # Using npx to ensure we get the latest eslint-plugin-security
            result = subprocess.run(
                [
                    "npx", "--yes",
                    "eslint",
                    tmp_path,
                    "--format", "json",
                    "--plugin", "security"
                ],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            # Parse ESLint output
            findings = []
            if result.stdout:
                try:
                    eslint_output = json.loads(result.stdout)
                    for file_result in eslint_output:
                        for message in file_result.get("messages", []):
                            # Map ESLint severity: 2=error, 1=warning, 0=off
                            severity_map = {
                                2: "critical",
                                1: "high",
                                0: "low"
                            }
                            
                            # Check if it's a security rule
                            rule_id = message.get("ruleId", "")
                            if "security" in rule_id.lower() or "no-eval" in rule_id or "no-implied-eval" in rule_id:
                                severity = severity_map.get(message.get("severity", 1), "medium")
                                
                                findings.append({
                                    "rule": rule_id,
                                    "severity": severity,
                                    "message": message.get("message", ""),
                                    "line": message.get("line"),
                                    "column": message.get("column")
                                })
                except json.JSONDecodeError:
                    workflow_logger.log(
                        thread_id,
                        "warn",
                        f"Failed to parse ESLint JSON output: {result.stdout}",
                        "eslint_tool"
                    )
            
            workflow_logger.log(
                thread_id,
                "info",
                f"ESLint found {len(findings)} security issues",
                "eslint_tool"
            )
            
            return findings
            
        finally:
            # Clean up temp file
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
                
    except subprocess.TimeoutExpired:
        workflow_logger.log(
            thread_id,
            "error",
            "ESLint execution timed out",
            "eslint_tool"
        )
        return []
    except Exception as e:
        workflow_logger.log(
            thread_id,
            "error",
            f"ESLint execution failed: {str(e)}",
            "eslint_tool"
        )
        return []


def analyze_security(file_content: str, file_type: str, thread_id: str) -> List[SecurityFinding]:
    """
    Analyze file for security issues.
    Currently supports ESLint for JS/TS files.
    """
    if file_type in ["js", "jsx", "ts", "tsx"]:
        return run_eslint(file_content, file_type, thread_id)
    elif file_type == "py":
        # Python analysis would go here (e.g., bandit, safety)
        workflow_logger.log(
            thread_id,
            "info",
            "Python security analysis not yet implemented",
            "security_analyzer"
        )
        return []
    else:
        return []

