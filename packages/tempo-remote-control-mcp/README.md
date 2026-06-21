# Tempo Remote Control MCP

Cloud-first MCP bridge for controlling the Tempo loop from Nebula, Cyrus,
Linear, and Slack.

## What This Does

This package exposes a Streamable HTTP MCP server at:

- `GET /health`
- `POST /mcp`

It is intentionally a control bridge, not a merge/deploy bypass. Its tools can:

- prepare safe Tempo loop commands
- post commands to Linear
- post commands to Slack
- send status/events to a Nebula webhook
- list recent GitHub PRs
- report which bridge environment variables are configured

It does not directly merge, deploy to production, change billing, create
secrets, or make destructive data changes.

## Required Environment

Set these on the bridge host:

```text
TEMPO_BRIDGE_TOKEN=long-random-shared-secret
LINEAR_API_KEY=lin_api_...
SLACK_BOT_TOKEN=xoxb-...
NEBULA_WEBHOOK_URL=https://www.nebula.gg/webhooks/...
GITHUB_TOKEN=github_pat_...
PORT=8787
```

`TEMPO_BRIDGE_TOKEN` is used by Nebula and Cyrus as:

```text
Authorization: Bearer <TEMPO_BRIDGE_TOKEN>
```

## Local Commands

```powershell
bun install
bun --filter @tempo/remote-control-mcp build
$env:TEMPO_BRIDGE_TOKEN="dev-test-token"
bun --filter @tempo/remote-control-mcp start
```

Then check:

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8787/health
```

## MCP Tools

- `tempo_bridge_prepare_command`
- `tempo_bridge_send_linear_command`
- `tempo_bridge_send_slack_command`
- `tempo_bridge_send_nebula_event`
- `tempo_bridge_report_status`
- `tempo_bridge_check_readiness`
- `tempo_bridge_list_github_prs`

## Safe Defaults

Loop commands default to:

```text
Stop before: merge, production deploy, secrets, billing, destructive data changes
```

For the Tempo loop this means:

1. Builders can work in branches/worktrees.
2. Verifiers can check and report.
3. Preview merge/deploy/test can be prepared.
4. Final production release still requires Amit approval.
