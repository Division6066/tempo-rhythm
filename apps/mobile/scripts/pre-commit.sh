#!/bin/bash

# Pre-commit hook for automatic logging and checks

echo "🔍 Running pre-commit checks..."

# Run dependency check
bun run check-deps || {
  echo "❌ Dependency check failed. Please install missing dependencies."
  exit 1
}

# Run linting
echo "🔍 Running linter..."
bun run lint || {
  echo "❌ Linting failed. Run 'bun run check:fix' to auto-fix issues."
  exit 1
}

# Run type check
echo "🔍 Running type check..."
bun run type-check || {
  echo "❌ Type check failed. Please fix TypeScript errors."
  exit 1
}

echo "✅ All pre-commit checks passed!"
exit 0

