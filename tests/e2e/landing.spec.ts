import { readFile } from "node:fs/promises";
import { createServer, type Server } from "node:http";
import { expect, test } from "@playwright/test";

const landingRoot = `${process.cwd()}/apps/landing/src`;

let server: Server;
let baseUrl: string;

test.beforeAll(async () => {
  server = createServer(async (request, response) => {
    const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
    const filePath = `${landingRoot}${
      pathname === "/"
        ? "/index.html"
        : pathname.includes(".")
          ? pathname
          : `${pathname}/index.html`
    }`;

    try {
      const body = await readFile(filePath);
      response.setHeader(
        "content-type",
        filePath.endsWith(".css") ? "text/css; charset=utf-8" : "text/html; charset=utf-8"
      );
      response.end(body);
    } catch {
      response.statusCode = 404;
      response.end("Not found");
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to start landing test server");
  }
  baseUrl = `http://127.0.0.1:${address.port}`;
});

test.afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
});

test("public pre-login landing page has headline, value props, and signup CTA", async ({
  page,
}) => {
  await page.goto(baseUrl);

  const headline = page.getByRole("heading", { level: 1 });
  await expect(headline).toBeVisible();
  await expect(headline).not.toHaveText("");

  await expect(page.getByTestId("value-props")).toBeVisible();
  await expect(page.getByTestId("value-prop").first()).toBeVisible();

  const cta = page.getByRole("link", { name: /start|sign up|login|sign in/i }).first();
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute("href", /sign-?up|sign-?in|login|auth/);

  const ctaHref = await cta.getAttribute("href");
  expect(ctaHref).not.toBeNull();
  const ctaResponse = await page.goto(new URL(ctaHref ?? "", baseUrl).toString());
  expect(ctaResponse?.ok()).toBe(true);
});
