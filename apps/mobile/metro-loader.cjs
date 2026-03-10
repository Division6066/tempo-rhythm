/**
 * Metro Loader for Windows ESM Path Fix
 * This file is loaded as an ESM loader hook
 * Converts Windows absolute paths to file:// URLs
 */

import { pathToFileURL } from 'url';
import { resolve } from 'path';

export async function resolve(specifier, context, nextResolve) {
  // Convert Windows paths to file:// URLs
  if (process.platform === 'win32' && specifier && specifier.match(/^[A-Z]:/)) {
    specifier = pathToFileURL(specifier).href;
  }
  return nextResolve(specifier, context);
}

