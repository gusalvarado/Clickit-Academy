// Example JavaScript file with security issues for testing

// CRITICAL: Use of eval() - dangerous!
function processUserInput(input) {
    return eval(input);  // This is a critical security vulnerability
}

// HIGH: Use of innerHTML with user input
function displayMessage(userMessage) {
    document.getElementById('content').innerHTML = userMessage;  // XSS vulnerability
}

// MEDIUM: Use of setTimeout with string (implied eval)
function delayedAction() {
    setTimeout("console.log('delayed')", 1000);  // Should use function instead
}

// LOW: Missing error handling
function fetchData(url) {
    fetch(url).then(response => response.json());  // No error handling
}

// This file should trigger ESLint security warnings
console.log("Example file loaded");

