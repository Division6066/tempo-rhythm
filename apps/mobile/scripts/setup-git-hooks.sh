#!/bin/bash

# Setup Git Hooks Script

echo "🔧 Setting up Git hooks..."

# Make scripts executable
chmod +x scripts/*.sh 2>/dev/null || true

# Copy hooks to .git/hooks
if [ -d ".git" ]; then
  cp scripts/pre-commit.sh .git/hooks/pre-commit
  cp scripts/post-commit.sh .git/hooks/post-commit
  
  # Make hooks executable
  chmod +x .git/hooks/pre-commit
  chmod +x .git/hooks/post-commit
  
  echo "✅ Git hooks installed successfully!"
  echo "   - pre-commit: Runs dependency check and linting"
  echo "   - post-commit: Logs commit to .git/commit-log.txt"
else
  echo "❌ Error: .git directory not found. Run 'git init' first."
  exit 1
fi

