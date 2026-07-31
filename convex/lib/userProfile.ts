/** Derive a short greeting name for dashboard copy. */
export function deriveGreetingName(
  fullName: string | undefined,
  email: string | undefined,
): string {
  const trimmed = fullName?.trim();
  if (trimmed) {
    return trimmed;
  }
  const localPart = email?.split("@")[0]?.trim();
  if (localPart) {
    return localPart;
  }
  return "there";
}
