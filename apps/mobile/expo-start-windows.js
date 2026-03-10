#!/usr/bin/env node
/**
 * Expo Start Wrapper for Windows Node 20/24
 * Bypasses ESM path loading issues by using CommonJS require
 */

const { spawn } = require('child_process');
const path = require('path');
const { pathToFileURL } = require('url');

// Force CommonJS for metro config on Windows
// Convert to absolute path and then to file:// URL for loader
const loaderPath = path.resolve(__dirname, 'metro-loader.mjs');
const loaderUrl = pathToFileURL(loaderPath).href;
process.env.NODE_OPTIONS = `--loader ${loaderUrl}`;

// Also try with require module
const args = ['expo', 'start', '--clear', ...process.argv.slice(2)];

const proc = spawn('npx', args, {
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

