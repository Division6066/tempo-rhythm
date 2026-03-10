// Node 24 Windows ESM workaround: convert absolute paths to file:// URLs
const path = require('path');
const Module = require('module');
const originalResolveFilename = Module.prototype._resolveFilename;

Module.prototype._resolveFilename = function(request, parent, isMain) {
  if (request && request.startsWith && !request.startsWith('.') && !request.startsWith('/')) {
    try {
      return originalResolveFilename.call(this, request, parent, isMain);
    } catch (e) {
      // Ignore and continue
    }
  }
  return originalResolveFilename.call(this, request, parent, isMain);
};

const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

// Workspace root so Metro can resolve the shared convex/ backend
const workspaceRoot = path.resolve(__dirname, '../..');
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Watch the workspace root so Metro picks up the shared convex/ directory
config.watchFolders = [workspaceRoot];

// Resolve modules from workspace root (shared convex/) as well
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Map @/convex/* to the shared workspace-root convex directory
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
};

module.exports = withNativeWind(config, { input: './global.css' });
