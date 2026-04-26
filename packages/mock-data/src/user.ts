import { MOCK_REFERENCE_MS } from "./constants";
import type { MockUser } from "./types";

/** Settings profile + billing copy — screens-4.jsx */
export const mockUser: MockUser = {
  id: "user-amit",
  name: "Amit Levin",
  email: "amitlevin65@protonmail.com",
  trialEndsAt: MOCK_REFERENCE_MS + 3 * 86400000,
  isPremium: true,
  preferences: {
    theme: "system",
    dyslexiaFont: false,
    reducedMotion: false,
  },
};

export const mockUserProfileFields = {
  displayName: "Amit",
  pronouns: "he/him",
  bio: "Building Tempo Flow, slowly, on cream paper.",
  oneWobble:
    "Shipping feels like a cathedral I can't enter on low-spoons days.",
} as const;

export const mockBillingCopy = {
  trialDay: 4,
  trialTotalDays: 7,
  daysLeft: 3,
  progressPct: 57,
  headline: "Your seven-day walk.",
  lede: "A dollar buys a week. Keep going, pause, or walk away — all are fine.",
} as const;
