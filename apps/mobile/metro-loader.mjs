/**
 * Metro Loader for Windows ESM Path Fix
 * Converts Windows absolute paths to file:// URLs for ESM loader
 */

import { pathToFileURL } from 'url';
import { fileURLToPath } from 'url';

export async function resolve(specifier, context, nextResolve) {
  // Convert Windows absolute paths (like c:\Users\...) to file:// URLs
  if (process.platform === 'win32' && specifier && typeof specifier === 'string') {
    // Check if it's a Windows absolute path (starts with drive letter)
    if (specifier.match(/^[A-Z]:[\\/]/i)) {
      try {
        specifier = pathToFileURL(specifier).href;
      } catch (e) {
        // If conversion fails, try to normalize the path
        specifier = specifier.replace(/\\/g, '/');
        if (!specifier.startsWith('file://')) {
          specifier = pathToFileURL(specifier).href;
        }
      }
    }
    // Also handle file:// URLs that might have Windows paths
    if (specifier.startsWith('file://') && specifier.includes('\\')) {
      specifier = specifier.replace(/\\/g, '/');
    }
    // Handle relative paths that resolve to Windows paths
    if (context.parentURL && specifier.startsWith('.')) {
      try {
        const parentPath = fileURLToPath(context.parentURL);
        const { resolve } = await import('path');
        const resolved = resolve(parentPath, '..', specifier);
        specifier = pathToFileURL(resolved).href;
      } catch (e) {
        // Fall through to nextResolve
      }
    }
  }
  return nextResolve(specifier, context);
}
