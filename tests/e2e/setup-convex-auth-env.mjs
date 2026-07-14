import { spawnSync } from "node:child_process";
import { generateKeyPairSync } from "node:crypto";

function runConvexEnvSet(name, value) {
  const result = spawnSync("bun", ["x", "convex", "env", "set", name, "--", value], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});
const privateKeyPem = privateKey
  .export({ format: "pem", type: "pkcs8" })
  .toString()
  .trimEnd()
  .replace(/\n/g, " ");
const publicJwk = publicKey.export({ format: "jwk" });
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicJwk }] });

runConvexEnvSet("JWT_PRIVATE_KEY", privateKeyPem);
runConvexEnvSet("JWKS", jwks);
runConvexEnvSet("BETA_ALLOWLIST_EMAILS", "today-e2e@example.com,today-e2e-clean@example.com");
runConvexEnvSet("BETA_FOUNDER_EMAIL", "today-e2e-founder@example.com");
