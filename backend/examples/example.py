# Example Python file with security issues for testing

import subprocess
import os

# CRITICAL: Command injection vulnerability
def execute_command(user_input):
    # Dangerous: directly executing user input
    os.system(f"ls {user_input}")  # Command injection risk

# HIGH: Use of eval with user input
def process_data(user_data):
    result = eval(user_data)  # Code injection risk
    return result

# MEDIUM: Hardcoded credentials (example)
API_KEY = "sk-1234567890abcdef"  # Should be in environment variable

# LOW: Missing input validation
def process_file(filename):
    with open(filename, 'r') as f:  # No path validation
        return f.read()

# This file demonstrates security issues for future Python analysis tools
print("Example Python file loaded")

