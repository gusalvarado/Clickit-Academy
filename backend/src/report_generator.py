"""Generate security analysis reports."""
from typing import Dict, List, Optional
from datetime import datetime
from src.logger import workflow_logger


def generate_report(thread_id: str, status_data: Dict) -> str:
    """
    Generate a human-readable security analysis report.
    
    Args:
        thread_id: Thread identifier
        status_data: Status data from get_status()
    
    Returns:
        Markdown-formatted report string
    """
    status = status_data.get("status", "unknown")
    findings = []
    interrupt_payload = status_data.get("interrupt_payload")
    logs = status_data.get("logs", [])
    error = status_data.get("error")
    
    # Extract findings - prefer all_findings, fallback to interrupt_payload
    if status_data.get("all_findings"):
        findings = status_data.get("all_findings", [])
    elif interrupt_payload:
        findings = interrupt_payload.get("findings", [])
    
    # Build report
    report_lines = [
        "# Security Analysis Report",
        "",
        f"**Thread ID:** `{thread_id}`",
        f"**Generated:** {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}",
        f"**Status:** {status.upper()}",
        "",
        "---",
        "",
        "## Summary",
        ""
    ]
    
    # Add status summary
    if status == "completed":
        report_lines.append("✅ Analysis completed successfully.")
    elif status == "interrupted":
        report_lines.append("⏸️ Analysis paused for human review.")
    elif status == "error":
        report_lines.append(f"❌ Analysis failed: {error or 'Unknown error'}")
    elif status == "running":
        report_lines.append("🔄 Analysis in progress...")
    
    report_lines.extend(["", "---", "", "## Security Findings", ""])
    
    if findings:
        # Group findings by severity
        by_severity = {
            "critical": [],
            "high": [],
            "medium": [],
            "low": []
        }
        
        for finding in findings:
            severity = finding.get("severity", "low")
            if severity in by_severity:
                by_severity[severity].append(finding)
        
        # Report findings by severity
        for severity in ["critical", "high", "medium", "low"]:
            severity_findings = by_severity[severity]
            if severity_findings:
                severity_emoji = {
                    "critical": "🔴",
                    "high": "🟠",
                    "medium": "🟡",
                    "low": "🟢"
                }
                report_lines.append(f"### {severity_emoji.get(severity, '•')} {severity.upper()} Severity ({len(severity_findings)} issues)")
                report_lines.append("")
                
                for finding in severity_findings:
                    rule = finding.get("rule", "Unknown rule")
                    message = finding.get("message", "")
                    line = finding.get("line")
                    column = finding.get("column")
                    
                    report_lines.append(f"- **{rule}**")
                    if message:
                        report_lines.append(f"  - {message}")
                    if line:
                        location = f"Line {line}"
                        if column:
                            location += f", Column {column}"
                        report_lines.append(f"  - Location: {location}")
                    report_lines.append("")
    else:
        report_lines.append("✅ No security issues found.")
    
    # Add execution log summary
    if logs:
        report_lines.extend(["", "---", "", "## Execution Log", ""])
        report_lines.append(f"Total log entries: {len(logs)}")
        report_lines.append("")
        
        # Show last 10 log entries
        recent_logs = logs[-10:] if len(logs) > 10 else logs
        for log in recent_logs:
            level = log.get("level", "info")
            message = log.get("message", "")
            node = log.get("node", "")
            timestamp = log.get("timestamp", "")
            
            level_emoji = {
                "error": "❌",
                "warn": "⚠️",
                "info": "ℹ️",
                "debug": "🔍"
            }
            
            log_line = f"- {level_emoji.get(level, '•')} [{level.upper()}]"
            if node:
                log_line += f" [{node}]"
            log_line += f" {message}"
            if timestamp:
                log_line += f" ({timestamp})"
            report_lines.append(log_line)
    
    # Add approval decision if available
    if interrupt_payload and status != "interrupted":
        decision = "approved" if status == "completed" else "rejected"
        report_lines.extend([
            "",
            "---",
            "",
            "## Human Review",
            "",
            f"**Decision:** {decision.upper()}",
            ""
        ])
    
    return "\n".join(report_lines)


def get_report_summary(thread_id: str, status_data: Dict) -> Dict:
    """
    Get a brief summary of the analysis for quick reference.
    
    Returns:
        Dictionary with summary statistics
    """
    findings = []
    
    # Get findings from all_findings or interrupt_payload
    if status_data.get("all_findings"):
        findings = status_data.get("all_findings", [])
    else:
        interrupt_payload = status_data.get("interrupt_payload")
        if interrupt_payload:
            findings = interrupt_payload.get("findings", [])
    
    # Count by severity
    severity_counts = {
        "critical": 0,
        "high": 0,
        "medium": 0,
        "low": 0
    }
    
    for finding in findings:
        severity = finding.get("severity", "low")
        if severity in severity_counts:
            severity_counts[severity] += 1
    
    total_findings = len(findings)
    critical_high = severity_counts["critical"] + severity_counts["high"]
    
    return {
        "thread_id": thread_id,
        "status": status_data.get("status"),
        "total_findings": total_findings,
        "critical_findings": severity_counts["critical"],
        "high_findings": severity_counts["high"],
        "medium_findings": severity_counts["medium"],
        "low_findings": severity_counts["low"],
        "requires_approval": critical_high > 0,
        "log_count": len(status_data.get("logs", [])),
        "error": status_data.get("error")
    }

