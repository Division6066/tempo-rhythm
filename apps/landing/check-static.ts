import { readFile } from "node:fs/promises";

const html = await readFile("src/index.html", "utf8");
const css = await readFile("src/styles.css", "utf8");

function fail(message: string): never {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function stripTags(value: string): string {
  return value
    .replaceAll(/<[^>]*>/g, "")
    .replaceAll(/\s+/g, " ")
    .trim();
}

const forbiddenCopy = /lorem ipsum|placeholder text|TODO:/i;
if (forbiddenCopy.test(html) || forbiddenCopy.test(css)) {
  fail("Landing page contains forbidden placeholder copy.");
}

const headline = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
if (!headline || stripTags(headline[1] ?? "").length === 0) {
  fail("Landing page must include a non-empty h1 headline.");
}

if (!html.includes('data-testid="value-props"')) {
  fail("Landing page must include a visible value-props section target.");
}

if (!html.includes('data-testid="value-prop"')) {
  fail("Landing page must include at least one value-prop card target.");
}

if (!/href="\/(?:sign-up|sign-in|login|auth)[^"]*"/i.test(html)) {
  fail("Landing page must include a CTA link to sign-up, sign-in, login, or auth.");
}

if (!html.includes('href="/styles.css"')) {
  fail("Landing page must reference its stylesheet.");
}

process.stdout.write("landing static content checks passed\n");
