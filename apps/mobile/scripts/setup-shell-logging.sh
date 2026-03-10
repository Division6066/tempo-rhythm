#!/bin/bash

# Shell Command Logging Setup Script
# This script configures shell history logging for development troubleshooting

LOG_DIR="${HOME}/.mobile-template-logs"
SHELL_LOG_FILE="${LOG_DIR}/shell-commands.log"
SHELL_RC_SNIPPET='
# Mobile Template Command Logging
export MOBILE_TEMPLATE_LOG_DIR="'"${LOG_DIR}"'"
export MOBILE_TEMPLATE_LOG_FILE="'"${SHELL_LOG_FILE}"'"

if [ ! -d "${MOBILE_TEMPLATE_LOG_DIR}" ]; then
  mkdir -p "${MOBILE_TEMPLATE_LOG_DIR}"
fi

# Log all commands with timestamp
PROMPT_COMMAND="echo \"[\$(date '+%Y-%m-%d %H:%M:%S')] [\$(pwd)] $BASH_COMMAND\" >> ${MOBILE_TEMPLATE_LOG_FILE}; $PROMPT_COMMAND"
'

echo "🔧 Setting up shell command logging..."

# Create log directory
mkdir -p "${LOG_DIR}"
echo "✅ Created log directory: ${LOG_DIR}"

# Detect shell
SHELL_NAME=$(basename "$SHELL")
case "$SHELL_NAME" in
  bash)
    RC_FILE="${HOME}/.bashrc"
    ;;
  zsh)
    RC_FILE="${HOME}/.zshrc"
    ;;
  *)
    echo "⚠️  Unsupported shell: $SHELL_NAME"
    echo "   Supported shells: bash, zsh"
    exit 1
    ;;
esac

# Check if logging already configured
if grep -q "Mobile Template Command Logging" "${RC_FILE}" 2>/dev/null; then
  echo "ℹ️  Shell logging already configured in ${RC_FILE}"
else
  # Append snippet to shell rc file
  echo "" >> "${RC_FILE}"
  echo "${SHELL_RC_SNIPPET}" >> "${RC_FILE}"
  echo "✅ Added logging configuration to ${RC_FILE}"
fi

# Source the file to activate logging
source "${RC_FILE}" 2>/dev/null || true

echo ""
echo "✅ Shell command logging configured!"
echo "   Log file: ${SHELL_LOG_FILE}"
echo "   Commands will be logged with timestamps"
echo ""
echo "View logs with: tail -f ${SHELL_LOG_FILE}"
echo ""

