import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const SERVER_VERSION = "0.1.0";
const DEFAULT_PORT = 8787;
const MAX_TEXT_LENGTH = 12_000;

type JsonObject = Record<string, unknown>;

const server = new McpServer({
  name: "tempo-remote-control-mcp-server",
  version: SERVER_VERSION,
});

const ResponseFormatSchema = z.enum(["markdown", "json"]).default("markdown");

const safeActions = [
  "build",
  "verify",
  "debug",
  "summarize",
  "prepare-pr",
] as const;

const CommandSchema = z
  .object({
    project: z.string().default("Tempo"),
    ticket: z.string().min(3).max(32),
    action: z.enum(safeActions),
    agent_budget: z.number().int().min(1).max(10).default(1),
    scope: z.string().min(3).max(1200),
    stop_before: z
      .array(z.string().min(2).max(80))
      .default([
        "merge",
        "production deploy",
        "secrets",
        "billing",
        "destructive data changes",
      ]),
    report_to: z
      .array(z.enum(["linear", "slack", "nebula"]))
      .default(["linear", "slack"]),
    response_format: ResponseFormatSchema,
  })
  .strict();

const StatusSchema = z
  .object({
    source: z.enum(["nebula", "cyrus", "linear", "slack", "github", "codex"]),
    ticket: z.string().min(3).max(32).optional(),
    status: z.enum(["queued", "running", "blocked", "needs-approval", "done", "failed"]),
    summary: z.string().min(1).max(4000),
    links: z.array(z.string().url()).default([]),
    response_format: ResponseFormatSchema,
  })
  .strict();

const NebulaEventSchema = z
  .object({
    event_type: z
      .enum(["loop-command", "loop-status", "approval-needed", "blocked", "done"])
      .default("loop-status"),
    ticket: z.string().min(3).max(32).optional(),
    title: z.string().min(1).max(200),
    body: z.string().min(1).max(MAX_TEXT_LENGTH),
    response_format: ResponseFormatSchema,
  })
  .strict();

const GitHubPrSchema = z
  .object({
    repository: z.string().default("Division6066/tempo-rhythm"),
    state: z.enum(["open", "closed", "all"]).default("open"),
    limit: z.number().int().min(1).max(20).default(10),
    response_format: ResponseFormatSchema,
  })
  .strict();

function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function requireEnv(name: string): string {
  const value = env(name);
  if (!value) {
    throw new Error(`Missing ${name}. Add it to the bridge server environment.`);
  }
  return value;
}

function trimText(value: string): string {
  return value.length <= MAX_TEXT_LENGTH
    ? value
    : `${value.slice(0, MAX_TEXT_LENGTH)}\n\n[truncated]`;
}

function commandText(input: z.infer<typeof CommandSchema>): string {
  return [
    `Project: ${input.project}`,
    `Ticket: ${input.ticket}`,
    `Action: ${input.action}`,
    `Agent budget: ${input.agent_budget}`,
    `Scope: ${input.scope}`,
    `Stop before: ${input.stop_before.join(", ")}`,
    `Report to: ${input.report_to.join(" + ")}`,
  ].join("\n");
}

function formatResult(data: JsonObject, responseFormat: "markdown" | "json"): string {
  if (responseFormat === "json") {
    return JSON.stringify(data, null, 2);
  }

  const lines: string[] = [];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`- **${key}**: ${value.join(", ")}`);
    } else if (typeof value === "object" && value != null) {
      lines.push(`- **${key}**: \`${JSON.stringify(value)}\``);
    } else {
      lines.push(`- **${key}**: ${String(value)}`);
    }
  }
  return lines.join("\n");
}

async function readJsonBody(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : undefined;
}

async function postJson(url: string, body: unknown, headers: Record<string, string> = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`POST ${url} failed with ${response.status}: ${trimText(text)}`);
  }

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { text };
  }
}

async function linearGraphql<T>(query: string, variables: JsonObject): Promise<T> {
  const token = requireEnv("LINEAR_API_KEY");
  const result = await postJson(
    "https://api.linear.app/graphql",
    { query, variables },
    { authorization: token.startsWith("Bearer ") ? token : token },
  );

  const payload = result as { data?: T; errors?: Array<{ message?: string }> };
  if (payload.errors?.length) {
    throw new Error(payload.errors.map((error) => error.message ?? "Linear error").join("; "));
  }
  if (!payload.data) {
    throw new Error("Linear response did not include data.");
  }
  return payload.data;
}

async function createLinearComment(issueId: string, body: string): Promise<string | undefined> {
  const data = await linearGraphql<{
    commentCreate: { success: boolean; comment?: { id: string; url?: string } };
  }>(
    `mutation CreateComment($issueId: String!, $body: String!) {
      commentCreate(input: { issueId: $issueId, body: $body }) {
        success
        comment { id url }
      }
    }`,
    { issueId, body },
  );

  if (!data.commentCreate.success) {
    throw new Error("Linear commentCreate returned success=false.");
  }
  return data.commentCreate.comment?.url ?? data.commentCreate.comment?.id;
}

async function postSlack(channelId: string, text: string): Promise<string | undefined> {
  const token = requireEnv("SLACK_BOT_TOKEN");
  const result = await postJson(
    "https://slack.com/api/chat.postMessage",
    { channel: channelId, text },
    {
      authorization: `Bearer ${token}`,
      "content-type": "application/json; charset=utf-8",
    },
  );

  const payload = result as { ok?: boolean; error?: string; channel?: string; ts?: string };
  if (!payload.ok) {
    throw new Error(`Slack chat.postMessage failed: ${payload.error ?? "unknown error"}`);
  }
  return payload.channel && payload.ts
    ? `https://slack.com/app_redirect?channel=${payload.channel}&message_ts=${payload.ts}`
    : undefined;
}

async function postNebula(event: z.infer<typeof NebulaEventSchema> | z.infer<typeof StatusSchema>) {
  const webhookUrl = requireEnv("NEBULA_WEBHOOK_URL");
  return postJson(webhookUrl, event);
}

server.registerTool(
  "tempo_bridge_prepare_command",
  {
    title: "Prepare Tempo Control Command",
    description:
      "Create a safe, bounded Tempo loop command for Nebula, Linear, Slack, or Cyrus. This formats the command only; it does not send it.",
    inputSchema: CommandSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (input) => {
    const command = commandText(input);
    const output = {
      command,
      manual_gates: input.stop_before,
      next_step: "Paste this into Nebula, #tempo-control, or a Linear issue assigned/delegated to Cyrus.",
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_send_linear_command",
  {
    title: "Send Tempo Command To Linear",
    description:
      "Append a safe Tempo loop command to a Linear issue so Cyrus cloud can use the issue as the work source. Requires LINEAR_API_KEY.",
    inputSchema: CommandSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    const body = `Tempo remote-control command:\n\n\`\`\`text\n${commandText(input)}\n\`\`\``;
    const link = await createLinearComment(input.ticket, body);
    const output = {
      sent: true,
      target: "linear",
      ticket: input.ticket,
      link,
      command: commandText(input),
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_send_slack_command",
  {
    title: "Send Tempo Command To Slack",
    description:
      "Post a safe Tempo loop command to Slack. Use #tempo-control for phone/Nebula control. Requires SLACK_BOT_TOKEN.",
    inputSchema: CommandSchema.extend({
      channel_id: z.string().default("C0BAJVAHMFA"),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    const text = `Tempo remote-control command:\n\`\`\`${commandText(input)}\`\`\``;
    const link = await postSlack(input.channel_id, text);
    const output = {
      sent: true,
      target: "slack",
      channel_id: input.channel_id,
      link,
      command: commandText(input),
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_send_nebula_event",
  {
    title: "Send Tempo Event To Nebula",
    description:
      "Send a loop command, status, approval-needed, blocked, or done event to a Nebula webhook. Requires NEBULA_WEBHOOK_URL.",
    inputSchema: NebulaEventSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    const result = await postNebula(input);
    const output = {
      sent: true,
      target: "nebula",
      event_type: input.event_type,
      ticket: input.ticket,
      result,
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_report_status",
  {
    title: "Report Tempo Loop Status",
    description:
      "Format and optionally forward loop status to Nebula. Use for Cyrus-to-Nebula updates after a run or blocker.",
    inputSchema: StatusSchema.extend({
      send_to_nebula: z.boolean().default(false),
    }).strict(),
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: false,
      openWorldHint: true,
    },
  },
  async (input) => {
    const payload = {
      source: input.source,
      ticket: input.ticket,
      status: input.status,
      summary: input.summary,
      links: input.links,
      created_at: new Date().toISOString(),
    };
    const nebulaResult = input.send_to_nebula ? await postNebula(input) : undefined;
    const output = {
      ...payload,
      sent_to_nebula: input.send_to_nebula,
      nebula_result: nebulaResult,
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_check_readiness",
  {
    title: "Check Tempo Bridge Readiness",
    description:
      "Report which environment variables are present for the remote-control bridge. Does not expose secret values.",
    inputSchema: z.object({ response_format: ResponseFormatSchema }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  },
  async (input) => {
    const output = {
      bridge_token: Boolean(env("TEMPO_BRIDGE_TOKEN")),
      linear_api_key: Boolean(env("LINEAR_API_KEY")),
      slack_bot_token: Boolean(env("SLACK_BOT_TOKEN")),
      nebula_webhook_url: Boolean(env("NEBULA_WEBHOOK_URL")),
      github_token: Boolean(env("GITHUB_TOKEN")),
      safe_by_default: true,
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

server.registerTool(
  "tempo_bridge_list_github_prs",
  {
    title: "List Tempo GitHub PRs",
    description:
      "List recent pull requests from the Tempo GitHub repository. Requires GITHUB_TOKEN. Read-only.",
    inputSchema: GitHubPrSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: true,
    },
  },
  async (input) => {
    const token = requireEnv("GITHUB_TOKEN");
    const [owner, repo] = input.repository.split("/");
    if (!owner || !repo) {
      throw new Error("repository must be in owner/name format.");
    }
    const url = new URL(`https://api.github.com/repos/${owner}/${repo}/pulls`);
    url.searchParams.set("state", input.state);
    url.searchParams.set("per_page", String(input.limit));
    const response = await fetch(url, {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "x-github-api-version": "2022-11-28",
      },
    });
    if (!response.ok) {
      throw new Error(`GitHub PR list failed with ${response.status}: ${await response.text()}`);
    }
    const prs = (await response.json()) as Array<{
      number: number;
      title: string;
      state: string;
      html_url: string;
      draft?: boolean;
    }>;
    const output = {
      repository: input.repository,
      count: prs.length,
      prs: prs.map((pr) => ({
        number: pr.number,
        title: pr.title,
        state: pr.state,
        draft: Boolean(pr.draft),
        url: pr.html_url,
      })),
    };
    return {
      content: [{ type: "text", text: formatResult(output, input.response_format) }],
      structuredContent: output,
    };
  },
);

async function handleMcpRequest(req: IncomingMessage, res: ServerResponse) {
  const token = env("TEMPO_BRIDGE_TOKEN");
  if (token && req.headers.authorization !== `Bearer ${token}`) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Unauthorized. Provide Authorization: Bearer <TEMPO_BRIDGE_TOKEN>." }));
    return;
  }

  const body = await readJsonBody(req);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });

  res.on("close", () => {
    transport.close();
  });

  await server.connect(transport);
  await transport.handleRequest(req, res, body);
}

const httpServer = createServer(async (req, res) => {
  try {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ ok: true, version: SERVER_VERSION, request_id: randomUUID() }));
      return;
    }

    if (req.method === "POST" && req.url === "/mcp") {
      await handleMcpRequest(req, res);
      return;
    }

    res.writeHead(404, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: "Not found. Use POST /mcp or GET /health." }));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    res.writeHead(500, { "content-type": "application/json" });
    res.end(JSON.stringify({ error: message }));
  }
});

const port = Number.parseInt(env("PORT") ?? String(DEFAULT_PORT), 10);
httpServer.listen(port, () => {
  console.error(`tempo-remote-control-mcp-server listening on http://127.0.0.1:${port}/mcp`);
});
