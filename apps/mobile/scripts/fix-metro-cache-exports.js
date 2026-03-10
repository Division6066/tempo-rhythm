#!/usr/bin/env node
/**
 * Fix for Metro Cache exports on Node 20/22 Windows
 * Adds missing ./src/stores/* export to metro-cache
 */

const fs = require('fs');
const path = require('path');

const metroCachePath = path.join(__dirname, '../node_modules/metro-cache/package.json');

try {
  if (fs.existsSync(metroCachePath)) {
    const metroCachePackage = JSON.parse(fs.readFileSync(metroCachePath, 'utf-8'));
    
    // Add missing export for FileStore
    if (!metroCachePackage.exports) {
      metroCachePackage.exports = {};
    }
    
    if (!metroCachePackage.exports['./src/stores/*']) {
      metroCachePackage.exports['./src/stores/*'] = './src/stores/*.js';
      fs.writeFileSync(metroCachePath, JSON.stringify(metroCachePackage, null, 2) + '\n');
      console.log('✓ Fixed Metro Cache exports for Windows compatibility');
    } else {
      console.log('✓ Metro Cache exports already fixed');
    }
  } else {
    console.warn('⚠ metro-cache package.json not found');
  }
} catch (e) {
  console.warn('⚠ Could not apply Metro Cache fix:', e.message);
}

