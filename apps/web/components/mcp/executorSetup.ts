export function buildExecutorSetup(endpoint: string): string {
  return [
    "Tempo MCP source",
    "Source type: Streamable HTTP",
    `URL: ${endpoint}`,
    "Header: Authorization: Bearer <paste your token>",
  ].join("\n");
}
