// @tempo/types — shared TypeScript type exports

export type AppEnv = "dev" | "staging" | "prod";

export type UserTier = "basic" | "pro" | "max";

export type UserRole = "admin" | "user";

export type SubscriptionTier = {
  id: UserTier;
  label: string;
  monthlyPrice: number;
  annualPrice: number;
  entitlement: string;
};

export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  { id: "basic", label: "Basic", monthlyPrice: 5, annualPrice: 50, entitlement: "basic" },
  { id: "pro", label: "Pro", monthlyPrice: 10, annualPrice: 100, entitlement: "pro" },
  { id: "max", label: "Max", monthlyPrice: 20, annualPrice: 200, entitlement: "max" },
];

export type ConvexDeployment = {
  name: string;
  url: string;
  region: string;
  env: AppEnv;
};

export const CONVEX_DEPLOYMENTS: ConvexDeployment[] = [
  { name: "tremendous-bass-443", url: "https://tremendous-bass-443.convex.cloud", region: "us", env: "dev" },
  { name: "ceaseless-dog-617", url: "https://ceaseless-dog-617.convex.cloud", region: "eu", env: "staging" },
  { name: "precious-wildcat-890", url: "https://precious-wildcat-890.eu-west-1.convex.cloud", region: "eu", env: "prod" },
];
