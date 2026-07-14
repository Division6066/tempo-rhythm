const [envPath] = process.argv.slice(2);

if (!envPath) {
  throw new Error("Usage: bun tests/e2e/configure-convex-auth-env.ts <env-path>");
}

const text = await Bun.file(envPath).text();
const entries = text
  .split("\n")
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => {
    const separator = line.indexOf("=");
    if (separator === -1) {
      throw new Error(`Invalid env line: ${line}`);
    }
    return [line.slice(0, separator), line.slice(separator + 1)] as const;
  })
  .filter(([name]) => !name.startsWith("CONVEX_"));

for (const [name, value] of entries) {
  const result = Bun.spawnSync([
    "bun",
    "x",
    "convex",
    "env",
    "--env-file",
    envPath,
    "set",
    name,
    "--",
    value,
  ]);

  if (result.exitCode !== 0) {
    const stderr = new TextDecoder().decode(result.stderr);
    const stdout = new TextDecoder().decode(result.stdout);
    throw new Error(`Could not set ${name}:\n${stdout}\n${stderr}`);
  }
}
