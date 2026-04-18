/**
 * Metro Loader for Windows ESM Path Fix
 * This file is loaded as an ESM loader hook
 * Converts Windows absolute paths to file:// URLs
 */

import { pathToFileURL } from 'node:url';

export async function resolve(specifier, context, nextResolve) {
  let spec = specifier;
  if (process.platform === 'win32' && spec && spec.match(/^[A-Z]:/)) {
    spec = pathToFileURL(spec).href;
  }
  return nextResolve(spec, context);
}

