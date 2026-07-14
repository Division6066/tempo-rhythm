import { createServer, type Server } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { test, expect } from "@playwright/test";

const webRoot = resolve(__dirname, "..");
const exportRoot = join(webRoot, "dist");
const host = "127.0.0.1";

const routes = [
  { path: "/", heading: "Agentwright Mission Control" },
  { path: "/sessions", heading: "Sessions" },
  { path: "/sessions/demo-session", heading: "Session detail" },
  { path: "/sessions/demo-session/diff", heading: "Session diff" },
  { path: "/agents", heading: "Agents" },
  { path: "/tickets", heading: "Tickets" },
  { path: "/approvals", heading: "Approvals" },
  { path: "/vault", heading: "Vault" },
  { path: "/skills", heading: "Skills" },
  { path: "/usage", heading: "Usage" },
  { path: "/trash", heading: "Trash" },
  { path: "/settings", heading: "Settings" },
] as const;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
]);

function safePathname(pathname: string): string {
  const decodedPath = decodeURIComponent(pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.(\/|\\|$))+/, "");
  return normalizedPath === sep ? "" : normalizedPath.replace(/^[/\\]+/, "");
}

async function createStaticServer(): Promise<{ server: Server; baseURL: string }> {
  const server = createServer(async (request, response) => {
    const requestUrl = new URL(request.url ?? "/", `http://${host}`);
    const pathname = safePathname(requestUrl.pathname);
    const candidate = join(exportRoot, pathname);
    const filePath = extname(candidate) ? candidate : join(candidate, "index.html");
    const fallbackPath = join(exportRoot, "index.html");

    try {
      const file = await readFile(filePath);
      response.setHeader("content-type", contentTypes.get(extname(filePath)) ?? "application/octet-stream");
      response.end(file);
    } catch {
      const fallback = await readFile(fallbackPath);
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.end(fallback);
    }
  });

  await new Promise<void>((resolveReady, rejectReady) => {
    server.once("error", rejectReady);
    server.listen(0, host, () => {
      server.off("error", rejectReady);
      resolveReady();
    });
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Static test server did not bind to a TCP port");
  }

  return { server, baseURL: `http://${host}:${address.port}` };
}

let server: Server;
let baseURL: string;

test.beforeAll(async () => {
  const staticServer = await createStaticServer();
  server = staticServer.server;
  baseURL = staticServer.baseURL;
});

test.afterAll(async () => {
  await new Promise<void>((resolveClose, rejectClose) => {
    server.close((error) => {
      if (error) {
        rejectClose(error);
        return;
      }

      resolveClose();
    });
  });
});

for (const route of routes) {
  test(`renders the ${route.path} placeholder route`, async ({ page }) => {
    await page.goto(`${baseURL}${route.path}`);
    await expect(page.getByRole("heading", { level: 1, name: route.heading })).toBeVisible();
  });
}
