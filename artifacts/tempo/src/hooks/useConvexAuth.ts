import { useQuery, useMutation } from "convex/react";
import { api } from "../../../tempo-app/convex/_generated/api";

export function useCurrentUser() {
  return useQuery(api.users.getCurrentUser);
}

export function useSignOut() {
  return useMutation(api.auth.signOut as any);
}
