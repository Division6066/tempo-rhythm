#!/usr/bin/env node
/**
 * Comprehensive fix for all Metro packages on Windows
 * Adds wildcard exports to all metro-* packages
 */

const fs = require('fs');
const path = require('path');

const nodeModulesPaths = [
  // App-local node_modules (npm/yarn layouts).
  path.join(__dirname, '../node_modules'),
  // pnpm hoisted virtual store used by this monorepo.
  path.join(__dirname, '../../../node_modules/.pnpm/node_modules')
];

// List of Metro packages that need exports fixed
const metroPackages = [
  'metro',
  'metro-cache',
  'metro-transform-worker',
  'metro-runtime',
  'metro-resolver',
  'metro-core',
  'metro-source-map',
  'metro-minify-terser',
  'metro-file-map',
  'metro-config',
  'metro-babel-transformer'
];

let totalFixed = 0;

nodeModulesPaths.forEach(nodeModulesPath => {
  metroPackages.forEach(packageName => {
    const packagePath = path.join(nodeModulesPath, packageName, 'package.json');
    
    try {
      if (fs.existsSync(packagePath)) {
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
      
      // Ensure exports object exists
      if (!packageJson.exports) {
        packageJson.exports = {};
      }
      
      // Add conditional exports - Node.js doesn't support wildcards in exports
      // We need to add specific paths or use a pattern that works
      // For metro-transform-worker, add specific exports
      const knownExports = {};
      
      if (packageName === 'metro-transform-worker') {
        knownExports['./src/utils/getMinifier'] = './src/utils/getMinifier.js';
        knownExports['./src/utils/assetTransformer'] = './src/utils/assetTransformer.js';
      }
      
      // Add common exports for all packages
      Object.assign(knownExports, {
        // Catch-all mapping for deep internal Metro imports used by Expo.
        './src/*': './src/*.js',
        './src/lib/TerminalReporter': './src/lib/TerminalReporter.js',
        './src/lib/*': './src/lib/*.js',
        './src/DeltaBundler/Serializers/*': './src/DeltaBundler/Serializers/*.js',
        './src/utils/*': './src/utils/*.js',
        './src/stores/*': './src/stores/*.js',
        './src/DeltaBundler/Serializers/helpers/*': './src/DeltaBundler/Serializers/helpers/*.js'
      });
      
      let fixed = false;
      for (const [exportPath, exportValue] of Object.entries(knownExports)) {
        if (!packageJson.exports[exportPath]) {
          packageJson.exports[exportPath] = exportValue;
          fixed = true;
        }
      }
      
        if (fixed) {
          fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
          console.log(`✓ Fixed ${packageName} exports (${nodeModulesPath})`);
          totalFixed++;
        }
      }
    } catch (e) {
      console.warn(`⚠ Could not fix ${packageName} in ${nodeModulesPath}:`, e.message);
    }
  });
});

if (totalFixed > 0) {
  console.log(`\n✓ Fixed ${totalFixed} Metro package(s) for Windows compatibility`);
} else {
  console.log('\n✓ All Metro packages already fixed');
}

