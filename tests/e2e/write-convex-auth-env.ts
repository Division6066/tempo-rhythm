import { generateKeyPairSync } from "node:crypto";

const [outputPath, siteUrl] = process.argv.slice(2);

if (!outputPath || !siteUrl) {
  throw new Error("Usage: bun tests/e2e/write-convex-auth-env.ts <output-path> <site-url>");
}

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const jwtPrivateKey = privateKey
  .export({ format: "pem", type: "pkcs8" })
  .trimEnd()
  .replace(/\n/g, " ");
const publicJwk = publicKey.export({ format: "jwk" });
const jwks = JSON.stringify({ keys: [{ use: "sig", ...publicJwk }] });

await Bun.write(
  outputPath,
  [
    "CONVEX_DEPLOYMENT=anonymous:anonymous-agent",
    "CONVEX_URL=http://127.0.0.1:3210",
    "CONVEX_SITE_URL=http://127.0.0.1:3211",
    `SITE_URL=${siteUrl}`,
    `JWT_PRIVATE_KEY=${jwtPrivateKey}`,
    `JWKS=${jwks}`,
    "BETA_FOUNDER_EMAIL=amitlevin65@protonmail.com",
    "BETA_ALLOWLIST_EMAILS=amitlevin65@protonmail.com",
    "BETA_MAX_TESTERS=30",
    "",
  ].join("\n"),
);
