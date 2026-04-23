#!/usr/bin/env node
/**
 * Expo Start Wrapper for Windows Node 20/24
 * Bypasses ESM path loading issues by using CommonJS require
 */

const { spawn } = require('node:child_process');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

// Force CommonJS for metro config on Windows
// Convert to absolute path and then to file:// URL for loader
const loaderPath = path.resolve(__dirname, 'metro-loader.mjs');
const loaderUrl = pathToFileURL(loaderPath).href;
process.env.NODE_OPTIONS = `--loader ${loaderUrl}`;

// Use bunx so this works whether launched via `bun run dev` or directly.
// Falls back to npx if bunx is not available (e.g. pure Node environments).
const hasBun = (() => {
  try { require('node:child_process').execSync('bun --version', { stdio: 'ignore' }); return true; } catch { return false; }
})();
const runner = hasBun ? 'bunx' : 'npx';
const args = ['expo', 'start', '--clear', ...process.argv.slice(2)];

const proc = spawn(runner, args, {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    // Override any ESM preferences
    NODE_NO_WARNINGS: '1'
  }
});

proc.on('exit', code => {
  process.exit(code || 0);
});

