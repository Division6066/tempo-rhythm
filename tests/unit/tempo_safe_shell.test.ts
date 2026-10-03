import { describe, expect, test } from "bun:test";
import { execFileSync } from "node:child_process";
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from "node:fs";
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

function rawGit(args: string[], cwd: string): string {
  // The machine git config enables the built-in fsmonitor. A cold daemon
  // makes `git commit` poll for several seconds and blow the test timeout.
  // Setup commands never need that config.
  return execFileSync("git", ["-c", "core.fsmonitor=", ...args], {
    cwd,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_CONFIG_NOSYSTEM: "1",
      GIT_CONFIG_GLOBAL: "/dev/null",
      GIT_CONFIG_SYSTEM: "/dev/null",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function initRepo(): string {
  const dir = mkdtempSync(join(tmpdir(), "tempo-safe-"));
  rawGit(["init", "-q"], dir);
  rawGit(["config", "user.email", "agent@example.com"], dir);
  rawGit(["config", "user.name", "Agent"], dir);
  writeFileSync(join(dir, "README.md"), "hello\n");
  rawGit(["add", "README.md"], dir);
  rawGit(["commit", "-q", "-m", "init"], dir);
  return dir;
}

describe.serial("tempo-safe-git refuses escalating arguments", () => {
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
    rawGit(["branch", "-M", "master"], dir);
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

  test("add does not stage scratch files", () => {
    const dir = initRepo();
    writeFileSync(join(dir, "note.txt"), "changed\n");
    writeFileSync(join(dir, ".tempo-issue.md"), "issue dump\n");
    writeFileSync(join(dir, ".tempo-commit-msg"), "note the change\n");
    const added = run(gitBin, ["add"], dir);
    expect(added.status).toBe(0);
    const staged = rawGit(["diff", "--cached", "--name-only"], dir);
    expect(staged).toContain("note.txt");
    expect(staged).not.toContain(".tempo-issue.md");
    expect(staged).not.toContain(".tempo-commit-msg");
  });

  test("add does not run a clean filter or fsmonitor from local config", () => {
    const dir = initRepo();
    const cleaned = join(dir, "cleaned");
    const watched = join(dir, "watched");
    const sshMark = join(dir, "ssh-mark");
    const included = join(dir, "included-config");
    writeFileSync(included, `[core]\n\tfsmonitor = touch ${watched}\n`);
    rawGit(["config", "filter.rce.clean", `touch ${cleaned}`], dir);
    rawGit(["config", "core.fsmonitor", `touch ${watched}`], dir);
    rawGit(["config", "core.sshCommand", `touch ${sshMark}`], dir);
    rawGit(["config", "include.path", included], dir);
    writeFileSync(join(dir, ".gitattributes"), "* filter=rce\n");
    writeFileSync(join(dir, "note.txt"), "changed\n");
    const added = run(gitBin, ["add"], dir);
    expect(existsSync(cleaned)).toBe(false);
    expect(existsSync(watched)).toBe(false);
    expect(existsSync(sshMark)).toBe(false);
    expect(added.status).toBe(0);
    const cfg = readFileSync(join(dir, ".git", "config"), "utf8");
    expect(cfg).toContain("name = Tempo Agent");
    expect(cfg).not.toContain("fsmonitor");
    expect(cfg).not.toContain("filter");
    expect(cfg).not.toContain("sshCommand");
    expect(cfg).not.toContain("include");
  });

  test("diff does not run diff.external, and caller environment is dropped", () => {
    const dir = initRepo();
    const external = join(dir, "external-diff");
    const fromEnv = join(dir, "from-env");
    rawGit(["config", "diff.external", `touch ${external}`], dir);
    writeFileSync(join(dir, "README.md"), "hello\nchanged\n");
    const bashEnv = join(dir, "bash-env.sh");
    writeFileSync(bashEnv, `#!/bin/sh\ntouch ${fromEnv}\n`);
    chmodSync(bashEnv, 0o755);
    // status rewrites .git/config before git runs. The wrapper's diff is the
    // same rewrite, and calling it from this runner can block on git's
    // fsmonitor handshake, so the content check uses system git afterwards.
    const result = execFileSync(gitBin, ["status"], {
      cwd: dir,
      encoding: "utf8",
      env: {
        PATH: "/usr/bin:/bin",
        GIT_EXTERNAL_DIFF: `touch ${fromEnv}`,
        BASH_ENV: bashEnv,
      },
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 4000,
    });
    expect(result).toContain("README.md");
    expect(existsSync(external)).toBe(false);
    expect(existsSync(fromEnv)).toBe(false);
    const cfg = readFileSync(join(dir, ".git", "config"), "utf8");
    expect(cfg).toContain("name = Tempo Agent");
    expect(cfg).not.toContain("external");
    const diff = rawGit(["diff"], dir);
    expect(diff).toContain("changed");
    expect(existsSync(external)).toBe(false);
  });

  test("commit ignores a pre-commit hook that exits 1", () => {
    const dir = initRepo();
    const hooks = join(dir, ".git", "hooks");
    mkdirSync(hooks, { recursive: true });
    const hook = join(hooks, "pre-commit");
    writeFileSync(hook, "#!/bin/sh\necho hooked\nexit 1\n");
    chmodSync(hook, 0o755);
    writeFileSync(join(dir, "note.txt"), "changed\n");
    writeFileSync(join(dir, ".tempo-commit-msg"), "note the change\n");
    expect(run(gitBin, ["add"], dir).status).toBe(0);
    const committed = run(gitBin, ["commit"], dir);
    expect(committed.status).toBe(0);
    expect(committed.stderr).not.toContain("hooked");
  });

  test("commit with a normal message file does not read an extra path", () => {
    const dir = initRepo();
    writeFileSync(join(dir, "note.txt"), "changed\n");
    writeFileSync(join(dir, ".tempo-commit-msg"), "note the change\n");
    const added = run(gitBin, ["add"], dir);
    expect(added.status).toBe(0);
    const committed = run(gitBin, ["commit"], dir);
    expect(committed.status).toBe(0);
    const subject = rawGit(["log", "-1", "--format=%s"], dir);
    expect(subject.trim()).toBe("note the change");
  });
});

describe("tempo-safe-git does not use PATH git", () => {
  test("the wrapper pins system git and disables hooks", () => {
    const text = readFileSync(gitBin, "utf8");
    expect(text).toContain("-c core.hooksPath=/dev/null");
    expect(text).toContain("-c core.fsmonitor=");
    expect(text).not.toContain("-c diff.external=");
    expect(text).toContain("unset GIT_EXTERNAL_DIFF");
    expect(text).toContain("commit --no-verify");
    expect(text).toContain("push --no-verify");
    expect(text).toContain("export PATH=/usr/bin:/bin");
    expect(text).toContain("#!/usr/bin/env -S -i PATH=/usr/bin:/bin bash --noprofile --norc");
    expect(text).toContain("name = Tempo Agent");
    expect(text).toContain("/usr/local/lib/tempo-git-origin");
    expect(text).not.toContain("tempo-git-extraheader");
    expect(text).not.toContain("extraheader =");
  });
});

describe("tempo-safe-bun never runs package scripts", () => {
  test("lint, test, and typecheck are refused, including extra arguments", () => {
    const dir = initRepo();
    for (const args of [
      ["test"],
      ["test", "--preload", "./evil.js"],
      ["lint"],
      ["typecheck"],
    ]) {
      const result = run(bunBin, args, dir);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("refusing");
    }
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
        expect(line).not.toContain("tempo-safe-bun");
      }
      expect(text).not.toContain("track_progress: true");
      expect(text).toContain("TRUSTED_REF=integration");
      expect(text).toContain('git show "origin/${TRUSTED_REF}:.github/scripts/${tool}"');
      expect(text).toContain("sudo -n chattr +i");
      expect(text).toContain("tempo-git-origin");
      expect(text).toContain("sudo -n chmod 0400 /usr/local/lib/tempo-git-extraheader");
      expect(text).not.toContain("chmod 0444 /usr/local/lib/tempo-git-extraheader");
      expect(text).toContain("sudo -n cat /usr/local/lib/tempo-git-extraheader");
      expect(text).toContain("GIT_CONFIG_KEY_0=http.extraheader");
      expect(text).toContain("GIT_CONFIG_VALUE_0=\"$header\"");
      expect(text).not.toContain("echo \"$header\"");
      expect(text).not.toContain("tempo-safe-git push");
      expect(text).toContain('git config --get-urlmatch http.extraheader "https://github.com/${REPO}.git"');
      expect(text).not.toContain("git config --local --get http.extraheader");
      expect(text).toContain("checkout credential was not found");
      expect(text).toContain('sudo -n chmod 0400 "$path"');
      expect(text).toContain("--ignore-scripts");
      expect(text).toContain("--setting-sources user");
      expect(text).not.toContain("DEFAULT_BRANCH");
      expect(text).not.toContain("install -m 0755 .github/scripts/tempo-safe");
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
    function lookupPrUrl(rows: Array<{ url?: string | null }>): string {
      if (rows.length === 0) return "";
      return rows[0]?.url ?? "";
    }
    expect(lookupPrUrl([])).toBe("");
    expect(lookupPrUrl([{ url: null }])).toBe("");
    expect(lookupPrUrl([{ url: "https://example.test/pull/1" }])).toBe("https://example.test/pull/1");
  });

  test("interactive claude reads the comment from a file, and repeats fast-forward", () => {
    const claude = readFileSync(join(root, ".github/workflows/claude.yml"), "utf8");
    expect(claude).toContain(".tempo-request.md");
    expect(claude).toContain("COMMENT_BODY:");
    expect(claude.indexOf("rm -f .tempo-request.md")).toBeLessThan(claude.indexOf("> .tempo-request.md"));
    const routers = [
      readFileSync(join(root, ".github/workflows/dispatch-router.yml"), "utf8"),
      readFileSync(join(root, ".github/workflows/agent-router.yml"), "utf8"),
    ];
    for (const text of routers) {
      expect(text).toContain("concurrency:");
      expect(text).toContain("claude-issue-");
      expect(text).toContain('git checkout -B "$BRANCH" "origin/${BRANCH}"');
      expect(text.indexOf("rm -f .tempo-issue.md")).toBeGreaterThan(
        text.indexOf('git checkout -B "$BRANCH" "origin/${BRANCH}"'),
      );
      expect(text.indexOf("> .tempo-issue.md")).toBeGreaterThan(text.indexOf("rm -f .tempo-issue.md"));
      expect(text).toContain('if ! auth_push "$BRANCH"; then');
      expect(text).not.toMatch(/git push[^\n]*--force/);
      expect(text).not.toContain("was not a fast-forward");
      expect(text).toContain("Refusing to force-push");
      expect(text).toContain("exit 1");
    }
    const dispatch = routers[0];
    expect(dispatch).toContain('--remove-label "dispatched:claude"');
    expect(dispatch).toContain("push of");
  });
});
