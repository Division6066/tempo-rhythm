#!/usr/bin/env node
/**
 * Remove empty @types/* folders under this package. Empty stubs make
 * `tsc` fail with TS2688 ("Cannot find type definition file for 'babel__core'").
 */
const fs = require("node:fs");
const path = require("node:path");

const atypes = path.join(__dirname, "..", "node_modules", "@types");

if (!fs.existsSync(atypes)) {
  process.exit(0);
}

for (const name of fs.readdirSync(atypes, { withFileTypes: true })) {
  if (!name.isDirectory()) continue;
  const dir = path.join(atypes, name.name);
  const entries = fs.readdirSync(dir);
  if (entries.length === 0) {
    fs.rmSync(dir, { recursive: true, force: true });
    console.log(`prune-empty-atypes: removed empty @types/${name.name}`);
  }
}
