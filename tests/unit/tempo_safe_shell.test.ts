import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = join(import.meta.dir, "../..");
const gitBin = join(root, ".github/scripts/tempo-safe-git");
const bunBin = join(root, ".github/scripts/tempo-safe-bun");
chmodSync(gitBin, 0o755);
chmodSync(bunBin, 0o755);

function run(bin: string, args: string[], cwd: string): { status: number; stderr: string; stdout: string } {
  try {
    const stdout = execFileSync(bin, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
    return { status: 0, stderr: "", stdout };
  } catch (error) {
    const failed = error as { status?: number; stderr?: string; stdout?: string };
    return {
      status: failed.status ?? 1,
      stderr: failed.stderr ?? "",
      stdout: failed.stdout ?? "",
    };
  }
}

function initRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "tempo-safe-"));
  execFileSync("git", ["init", "-q"], { cwd: dir });
  execFileSync("git", ["config", "user.email", "agent@example.com"], { cwd: dir });
  execFileSync("git", ["config", "user.name", "Agent"], { cwd: dir });
  writeFileSync(join(dir, "README.md"), "hello\n");
  execFileSync("git", ["add", "README.md"], { cwd: dir });
  execFileSync("git", ["commit", "-q", "-m", "init"], { cwd: dir });
  return dir;
}

describe("tempo-safe-git refuses escalating arguments", () => {
  test("commit rejects -F and any other argument", () => {
    const dir = initRepo();
    const result = run(gitBin, ["commit", "-F", "/proc/self/environ"], dir);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("takes no arguments");
  });

  test("push rejects --force, --delete, and a refspec", () => {
    const dir = initRepo();
    for (const args of [
      ["push", "--force"],
      ["push", "--delete"],
      ["push", "HEAD:integration"],
      ["push", "-u", "origin", "--force"],
    ]) {
      const result = run(gitBin, args, dir);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("takes no arguments");
    }
  });

  test("push of master is refused, and a colon in a branch file is refused", () => {
    const dir = initRepo();
    execFileSync("git", ["branch", "-M", "master"], { cwd: dir });
    const master = run(gitBin, ["push"], dir);
    expect(master.status).toBe(2);
    expect(master.stderr).toContain("refusing branch");

    writeFileSync(join(dir, ".tempo-branch-name"), "claude/bad:integration\n");
    const colon = run(gitBin, ["branch-new"], dir);
    expect(colon.status).toBe(2);
    expect(colon.stderr).toContain("refusing branch");
  });

  test("commit refuses a symlink message file", () => {
    const dir = initRepo();
    symlinkSync("/etc/hostname", join(dir, ".tempo-commit-msg"));
    const result = run(gitBin, ["commit"], dir);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("must not be a symlink");
  });

  test("commit with a normal message file does not read an extra path", () => {
    const dir = initRepo();
    writeFileSync(join(dir, "note.txt"), "changed\n");
    writeFileSync(join(dir, ".tempo-commit-msg"), "note the change\n");
    const added = run(gitBin, ["add"], dir);
    expect(added.status).toBe(0);
    const committed = run(gitBin, ["commit"], dir);
    expect(committed.status).toBe(0);
    const subject = execFileSync("git", ["log", "-1", "--format=%s"], { cwd: dir, encoding: "utf8" });
    expect(subject.trim()).toBe("note the change");
  });
});

describe("tempo-safe-bun refuses extra arguments", () => {
  test("test rejects --preload and any other argument", () => {
    const dir = initRepo();
    const result = run(bunBin, ["test", "--preload", "./evil.js"], dir);
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("takes no arguments");
  });
});

describe("dispatch and agent routers do not auto-approve escalating shell", () => {
  test("allowlists are exact wrapper commands", () => {
    const files = [
      ".github/workflows/dispatch-router.yml",
      ".github/workflows/agent-router.yml",
      ".github/workflows/claude.yml",
    ];
    for (const file of files) {
      const text = readFileSync(join(root, file), "utf8");
      const allowLines = text
        .split("\n")
        .filter((line) => line.includes("--allowedTools"));
      expect(allowLines.length).toBeGreaterThan(0);
      for (const line of allowLines) {
        expect(line).not.toContain("Bash(git ");
        expect(line).not.toContain("Bash(git:");
        expect(line).not.toContain("Bash(bun");
        expect(line).not.toContain("Bash(bunx");
        expect(line).not.toContain(":*");
        expect(line).toContain("/usr/local/bin/tempo-safe-git");
        expect(line).toContain("/usr/local/bin/tempo-safe-bun");
      }
    }
  });

  test("draft pull request steps do not trust an empty action output or the text null", () => {
    for (const file of [".github/workflows/dispatch-router.yml", ".github/workflows/agent-router.yml"]) {
      const text = readFileSync(join(root, file), "utf8");
      expect(text).not.toContain("steps.claude_code.outputs.branch_name");
      expect(text).toContain('if length == 0 then "" else .[0].url // "" end');
      expect(text).toContain('claude/issue-');
    }
  });

  test("agent-router does not interpolate workflow inputs into the shell", () => {
    const text = readFileSync(join(root, ".github/workflows/agent-router.yml"), "utf8");
    const injected = text.split("\n").filter((line) => {
      return line.includes("${{ inputs.") && !/^\s+INPUT_[A-Z]+:/.test(line);
    });
    expect(injected).toEqual([]);
    expect(text).toContain('case "$ISSUE" in');
    expect(text).toContain("*[!0-9]*");
  });

  test("empty and null pull request lookups are not treated as found", () => {
    const expr = 'if length == 0 then "" else .[0].url // "" end';
    const empty = execFileSync("jq", ["-r", expr], { input: "[]", encoding: "utf8" });
    const nulled = execFileSync("jq", ["-r", expr], {
      input: '[{"url":null}]',
      encoding: "utf8",
    });
    const found = execFileSync("jq", ["-r", expr], {
      input: '[{"url":"https://example.test/pull/1"}]',
      encoding: "utf8",
    });
    expect(empty.trim()).toBe("");
    expect(nulled.trim()).toBe("");
    expect(found.trim()).toBe("https://example.test/pull/1");
  });
});
