#!/usr/bin/env bash
# Cloud Agent install. Idempotent.
# Dependency steps (named by the environment contract):
#   bun install
#   uv tool install graphifyy
# Bun and uv are bootstrapped only when missing so those two commands can run
# on the default image. No env var values are written.
set -euo pipefail

export PATH="${HOME}/.bun/bin:${HOME}/.local/bin:/usr/local/bin:${PATH}"

if ! command -v bun >/dev/null 2>&1 || [[ "$(bun --version)" != "1.3.9" ]]; then
  curl -fsSL https://bun.sh/install | bash -s -- bun-v1.3.9
  export PATH="${HOME}/.bun/bin:${PATH}"
fi

if [[ -x "${HOME}/.bun/bin/bun" ]]; then
  sudo ln -sfn "${HOME}/.bun/bin/bun" /usr/local/bin/bun
  sudo ln -sfn "${HOME}/.bun/bin/bun" /usr/local/bin/bunx
fi

if ! command -v uv >/dev/null 2>&1; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="${HOME}/.local/bin:${PATH}"
fi

if [[ -x "${HOME}/.local/bin/uv" ]]; then
  sudo ln -sfn "${HOME}/.local/bin/uv" /usr/local/bin/uv
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${ROOT}"

bun install
uv tool install graphifyy

if [[ -x "${HOME}/.local/bin/graphify" ]]; then
  sudo ln -sfn "${HOME}/.local/bin/graphify" /usr/local/bin/graphify
fi
