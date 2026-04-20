// Node 24 Windows ESM workaround: convert absolute paths to file:// URLs
const path = require('node:path');
const Module = require('node:module');
const originalResolveFilename = Module.prototype._resolveFilename;

Module.prototype._resolveFilename = function (request, parent, isMain) {
  if (
    request?.startsWith &&
    !request.startsWith('.') &&
    !request.startsWith('/')
  ) {
    try {
      return originalResolveFilename.call(this, request, parent, isMain);
    } catch {
      // Ignore and fall through to the default resolver below.
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

// Merge with Expo's default watchFolders so we keep defaults AND add the
// workspace root (needed to pick up the shared convex/ directory).
const defaultWatchFolders = Array.isArray(config.watchFolders)
  ? config.watchFolders
  : [];
config.watchFolders = Array.from(
  new Set([...defaultWatchFolders, workspaceRoot])
);

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
