#!/usr/bin/env node
/**
 * Post-install fix for Metro on Node 22
 * Adds missing ./src/lib/* export to support TerminalReporter
 */

const fs = require('fs');
const path = require('path');

const metroPackagePath = path.join(__dirname, '../node_modules/metro/package.json');

try {
  if (fs.existsSync(metroPackagePath)) {
    const metroPackage = JSON.parse(fs.readFileSync(metroPackagePath, 'utf-8'));
    
    // Ensure exports object exists
    if (!metroPackage.exports) {
      metroPackage.exports = {};
    }
    
    // Add missing exports for Node 20/22 Windows compatibility
    const missingExports = {
      './src/lib/*': './src/lib/*.js',
      './src/DeltaBundler/Serializers/*': './src/DeltaBundler/Serializers/*.js',
      './src/*': './src/*.js'
    };
    
    let fixed = false;
    for (const [exportPath, exportValue] of Object.entries(missingExports)) {
      if (!metroPackage.exports[exportPath]) {
        metroPackage.exports[exportPath] = exportValue;
        fixed = true;
      }
    }
    
    if (fixed) {
      fs.writeFileSync(metroPackagePath, JSON.stringify(metroPackage, null, 2) + '\n');
      console.log('✓ Fixed Metro exports for Windows compatibility');
    } else {
      console.log('✓ Metro exports already fixed');
    }
  }
} catch (e) {
  console.warn('⚠ Could not apply Metro fix:', e.message);
}

