#!/bin/bash

# Post-commit hook for automatic logging

LOG_FILE=".git/commit-log.txt"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
COMMIT_HASH=$(git rev-parse --short HEAD)
COMMIT_MSG=$(git log -1 --pretty=%B)
AUTHOR=$(git log -1 --pretty=%an)
EMAIL=$(git log -1 --pretty=%ae)

# Create log entry
LOG_ENTRY="[${TIMESTAMP}] ${COMMIT_HASH} | ${AUTHOR} <${EMAIL}> | ${COMMIT_MSG}"

# Append to log file
echo "${LOG_ENTRY}" >> "${LOG_FILE}"

# Also log to console
echo "📝 Commit logged: ${COMMIT_HASH} - ${COMMIT_MSG}"
echo "📋 Full log: ${LOG_FILE}"

