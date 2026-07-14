export function normalizeProviderKeyInput(apiKey: string): string {
  const trimmed = apiKey.trim();
  if (trimmed.length < 8) {
    throw new Error("Provider key should be at least 8 characters.");
  }
  return trimmed;
}
