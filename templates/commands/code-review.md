---
description: Multi-aspect code review focusing on quality, security, and best practices
category: workflow
allowed-tools: Bash, Read, Grep, Glob, Task
argument-hint: "[file or directory to review]"
---

# Code Review

Perform a comprehensive code review focusing on multiple aspects.

## Review Aspects:

### 1. Code Quality
- Code clarity and readability
- Function/method complexity
- Proper error handling
- DRY principle adherence

### 2. Security
- Input validation
- SQL injection risks
- XSS vulnerabilities
- Sensitive data exposure

### 3. Performance
- Inefficient algorithms
- Memory leaks
- N+1 queries
- Unnecessary re-renders (for React)

### 4. Best Practices
- Following project conventions
- Proper typing (for TypeScript)
- Test coverage
- Documentation

## Steps:

1. Identify files to review (from argument or recent changes)
2. For each file, analyze all aspects
3. Provide a summary with:
   - Critical issues (must fix)
   - Warnings (should fix)
   - Suggestions (nice to have)
4. Include specific line references and suggested fixes
