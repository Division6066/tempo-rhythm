/**
 * TF-34 — secret-scan self-test.
 *
 * Proves the secret-scanning gate is wired and can actually detect a secret:
 *
 * 1. Verifies `.github/workflows/security.yml` exists and references both
 *    gitleaks and trufflehog.
 * 2. Writes a fixture file containing a canary AWS-style key to a temp dir and,
 *    when the `gitleaks` binary is available (it always is in the security
 *    workflow, which installs it), asserts gitleaks flags it. A scanner that
 *    cannot find the canary means the gate is decorative — fail loudly.
 *
 * Run: `bun run secret-scan:test-fixture`
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = path.resolve(import.meta.dir, "..");

const securityWorkflowPath = path.join(repoRoot, ".github", "workflows", "security.yml");
if (!fs.existsSync(securityWorkflowPath)) {
  console.error("secret-scan:test-fixture FAILED — .github/workflows/security.yml is missing.");
  process.exit(1);
}
const securityWorkflow = fs.readFileSync(securityWorkflowPath, "utf8");
if (!/gitleaks/i.test(securityWorkflow) || !/trufflehog/i.test(securityWorkflow)) {
  console.error(
    "secret-scan:test-fixture FAILED — security.yml must run both gitleaks and trufflehog.",
  );
  process.exit(1);
}

// Canary: a fake AWS access key id matching gitleaks' default aws-access-key
// rule. Generated at runtime (never a greppable string in the repo) and random
// so it clears gitleaks' entropy threshold and its docs-example allowlist.
const keyAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const randomSuffix = Array.from(
  { length: 16 },
  () => keyAlphabet[Math.floor(Math.random() * keyAlphabet.length)],
).join("");
const canary = `AKIA${randomSuffix}`;
const fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "tempo-secret-fixture-"));
const fixturePath = path.join(fixtureDir, "leaked-config.env");
fs.writeFileSync(fixturePath, `AWS_ACCESS_KEY_ID=${canary}\n`);

try {
  const gitleaks = spawnSync("gitleaks", ["detect", "--no-git", "--source", fixtureDir], {
    encoding: "utf8",
  });

  if (gitleaks.error) {
    const errnoError = gitleaks.error as NodeJS.ErrnoException;
    if (errnoError.code === "ENOENT") {
      console.log(
        "secret-scan:test-fixture OK (config-only) — gitleaks binary not installed locally; " +
          "workflow wiring verified. The security workflow runs the real detection in CI.",
      );
      process.exit(0);
    }
    console.error(
      `secret-scan:test-fixture FAILED — gitleaks could not be launched: ${gitleaks.error.message} (code: ${errnoError.code ?? "unknown"})`,
    );
    process.exit(1);
  }

  // gitleaks exit codes: 0 = clean, 1 = leaks found, other non-zero = runtime error.
  // Only exit code 1 proves the canary was detected. Treat crashes/usage errors as failure.
  if (gitleaks.status === 1) {
    console.log("secret-scan:test-fixture OK — gitleaks detected the canary secret as expected.");
    process.exit(0);
  }

  if (gitleaks.status === 0) {
    console.error(
      "secret-scan:test-fixture FAILED — gitleaks did NOT detect the canary secret. " +
        "The secret-scanning gate is not actually catching leaks.",
    );
  } else {
    console.error(
      `secret-scan:test-fixture FAILED — gitleaks exited with status ${String(gitleaks.status)} ` +
        "(expected 1 = leaks found). A scanner crash or usage error must not count as detection.",
    );
  }
  if (gitleaks.stdout?.trim()) console.error(`gitleaks stdout:\n${gitleaks.stdout.trim()}`);
  if (gitleaks.stderr?.trim()) console.error(`gitleaks stderr:\n${gitleaks.stderr.trim()}`);
  process.exit(1);
} finally {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
}
