"use client";

export const authEnabled = true;

export const GROK_PROVIDERS: { providerId: string; label: string }[] = [];

export const authClient = {
  signIn: {
    email: async (_input?: {
      email?: string;
      password?: string;
      callbackURL?: string;
    }) => ({ error: { message: "Use the magic-link form." } }),
  },
  signUp: {
    email: async (_input?: {
      email?: string;
      password?: string;
      name?: string;
      callbackURL?: string;
    }) => ({ error: { message: "Use the magic-link form." } }),
  },
};

export function signIn(): void {
  throw new Error("Social providers are not wired. Use the email magic link.");
}
