#!/usr/bin/env node
/**
 * Diagnostic script to check package installation integrity
 * Tests: H1 (Bun extraction), H3 (dependency resolution), H5 (path issues)
 */

const fs = require('fs');
const path = require('path');

const DEBUG_LOG = path.join(__dirname, '../.cursor/debug.log');

function log(hypothesisId, message, data) {
  const entry = JSON.stringify({
    sessionId: 'debug-session',
    runId: 'diagnosis',
    hypothesisId,
    location: 'scripts/diagnose.js',
    message,
    data,
    timestamp: Date.now()
  });
  
  try {
    fs.appendFileSync(DEBUG_LOG, entry + '\n');
  } catch (e) {
    console.error('[DIAG] Failed to write log:', e.message);
  }
  
  console.log(`[H${hypothesisId}] ${message}`, data);
}

function checkFile(filePath, hypothesisId, description) {
  try {
    const exists = fs.existsSync(filePath);
    const stat = exists ? fs.statSync(filePath) : null;
    log(hypothesisId, description, {
      path: filePath,
      exists,
      size: stat?.size,
      isFile: stat?.isFile?.(),
      isDirectory: stat?.isDirectory?.()
    });
    return exists;
  } catch (e) {
    log(hypothesisId, `Error checking ${description}`, { error: e.message });
    return false;
  }
}

console.log('\n🔍 DIAGNOSTIC RUN - Testing Hypotheses\n');

// H1: Bun extraction - check chalk source files
console.log('=== Testing H1 (Bun Extraction) ===');
checkFile('node_modules/chalk/source/index.js', '1', 'Root chalk source/index.js');
checkFile('node_modules/expo/node_modules/@expo/cli/node_modules/chalk/source/index.js', '1', 'Expo CLI chalk source/index.js');
checkFile('node_modules/metro/node_modules/chalk/source/index.js', '1', 'Metro chalk source/index.js');

// H3: Missing dependencies
console.log('\n=== Testing H3 (Dependency Resolution) ===');
checkFile('node_modules/compression/index.js', '3', 'Compression module');
checkFile('node_modules/source-map/source-map.js', '3', 'Source-map module');
checkFile('node_modules/source-map/lib/source-map-generator.js', '3', 'Source-map generator');

// H4: Metro/Expo compatibility
console.log('\n=== Testing H4 (Metro/Expo Compatibility) ===');
try {
  const metroPackage = JSON.parse(fs.readFileSync('node_modules/metro/package.json', 'utf-8'));
  const hasTerminalReporterExport = metroPackage.exports['./src/lib/*'] !== undefined;
  log('4', 'Metro exports configuration', {
    version: metroPackage.version,
    hasTerminalReporterExport,
    exportsKeys: Object.keys(metroPackage.exports || {})
  });
} catch (e) {
  log('4', 'Error reading metro package.json', { error: e.message });
}

// H5: Path/OneDrive issues
console.log('\n=== Testing H5 (Path/OneDrive Issues) ===');
const projectPath = process.cwd();
log('5', 'Project path analysis', {
  cwd: projectPath,
  hasOneDrive: projectPath.includes('OneDrive'),
  pathLength: projectPath.length,
  pathSeparators: projectPath.split(path.sep).length
});

console.log('\n✅ Diagnostics complete. Check .cursor/debug.log for details.\n');

