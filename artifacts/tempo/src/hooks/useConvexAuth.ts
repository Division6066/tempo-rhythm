import { useQuery, useMutation } from "convex/react";
// @ts-expect-error Convex generated API path resolution
import { api } from "../../../tempo-app/convex/_generated/api.js";

export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser);
}

export function useSignOut() {
  return useMutation(api.auth.signOut as any);
}
