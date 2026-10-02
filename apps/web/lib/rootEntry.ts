/**
 * Default entry for "/".
 *
 * Signed-out visitors go to /sign-in. Signed-in visitors go to /today.
 * A non-empty `code` query on "/" is a Convex Auth magic link. The auth
 * middleware exchanges that code before this decision on a normal browser
 * GET. If the code is still on the request, stay on "/" so the exchange
 * can finish. The follow-up request (no code, session cookies set) then
 * sends the signed-in visitor to /today.
 */
export const PUBLIC_ROUTE_PATTERNS = [
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy",
  "/contact",
  "/success",
] as const;

export function decideEntryRedirect(input: {
  pathname: string;
  search: string;
  isAuthenticated: boolean;
  isPublicRoute: boolean;
  isCalendarE2EBypass: boolean;
}): string | null {
  const query = input.search.startsWith("?") ? input.search.slice(1) : input.search;
  const code = new URLSearchParams(query).get("code");
  if (input.pathname === "/" && code) {
    return null;
  }

  if (!(input.isPublicRoute || input.isCalendarE2EBypass || input.isAuthenticated)) {
    const nextPath = `${input.pathname}${input.search}`;
    const params = new URLSearchParams({ next: nextPath });
    return `/sign-in?${params.toString()}`;
  }

  if (input.pathname === "/" && input.isAuthenticated) {
    return "/today";
  }

  return null;
}
