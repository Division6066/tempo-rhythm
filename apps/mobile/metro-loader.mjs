/**
 * Metro Loader for Windows ESM Path Fix
 * Converts Windows absolute paths to file:// URLs for ESM loader
 */

import { resolve as pathResolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  let spec = specifier;
  if (process.platform === 'win32' && spec && typeof spec === 'string') {
    if (spec.match(/^[A-Z]:[\\/]/i)) {
      try {
        spec = pathToFileURL(spec).href;
      } catch {
        spec = spec.replace(/\\/g, '/');
        if (!spec.startsWith('file://')) {
          spec = pathToFileURL(spec).href;
        }
      }
    }
    if (spec.startsWith('file://') && spec.includes('\\')) {
      spec = spec.replace(/\\/g, '/');
    }
    if (context.parentURL && spec.startsWith('.')) {
      try {
        const parentPath = fileURLToPath(context.parentURL);
        const resolved = pathResolve(parentPath, '..', spec);
        spec = pathToFileURL(resolved).href;
      } catch {
        // Fall through to nextResolve
      }
    }
  }
  return nextResolve(spec, context);
}
