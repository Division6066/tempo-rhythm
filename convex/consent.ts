import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { requireUser } from "./lib/requireUser";

export const consentPoints = [
  "connector_scope",
  "voice_permission",
  "trial_conversion",
  "refund_policy",
] as const;

export type ConsentPoint = (typeof consentPoints)[number];

type ConsentDefinition = {
  point: ConsentPoint;
  version: string;
  title: string;
  body: string;
  acknowledgment: string;
};

export type ConsentLogRecord = {
  userId: Id<"users">;
  point: ConsentPoint;
  version: string;
  copyText: string;
  acknowledgedAt: number;
  createdAt: number;
  updatedAt: number;
};

export const consentPointValidator = v.union(
  v.literal("connector_scope"),
  v.literal("voice_permission"),
  v.literal("trial_conversion"),
  v.literal("refund_policy")
);

export const consentDefinitions = {
  connector_scope: {
    point: "connector_scope",
    version: "2026-07-14.connector-scope.v1",
    title: "Connectors only use the scope you approve",
    body: "When you connect another tool, Tempo can only use the specific access listed for that connector. You can remove the connection later from Integrations.",
    acknowledgment: "I understand this connector uses only the scope shown here.",
  },
  voice_permission: {
    point: "voice_permission",
    version: "2026-07-14.voice-permission.v1",
    title: "Voice starts only when you choose it",
    body: "Tempo asks before using your microphone. Voice input is used to turn what you say into Tempo actions or notes; you can stop or skip voice at any time.",
    acknowledgment: "I understand when voice input is used and that I can stop it.",
  },
  trial_conversion: {
    point: "trial_conversion",
    version: "2026-07-14.trial-conversion.v1",
    title: "Trial billing is only placeholder text right now",
    body: "This phase does not charge payments. Any trial-conversion copy you see is a stub so we can test the consent moment before real billing is connected.",
    acknowledgment: "I understand this trial conversion text is a no-charge placeholder.",
  },
  refund_policy: {
    point: "refund_policy",
    version: "2026-07-14.refund-policy.v1",
    title: "Refund copy is a placeholder this phase",
    body: "Refund language is shown as stub text while payments are not active. No payment or refund request is submitted from this consent step.",
    acknowledgment: "I understand refund text is a placeholder until payments are active.",
  },
} satisfies Record<ConsentPoint, ConsentDefinition>;

export function getConsentDefinition(point: ConsentPoint): ConsentDefinition {
  const definition = consentDefinitions[point];
  if (!definition) {
    throw new Error("Unknown consent point.");
  }
  return definition;
}

export function buildConsentLogRecord({
  userId,
  point,
  now,
}: {
  userId: Id<"users">;
  point: ConsentPoint;
  now: number;
}): ConsentLogRecord {
  const definition = getConsentDefinition(point);

  return {
    userId,
    point,
    version: definition.version,
    copyText: `${definition.title}\n\n${definition.body}\n\n${definition.acknowledgment}`,
    acknowledgedAt: now,
    createdAt: now,
    updatedAt: now,
  };
}

export const acknowledge = mutation({
  args: {
    point: consentPointValidator,
  },
  handler: async (ctx, { point }) => {
    const user = await requireUser(ctx);
    const now = Date.now();
    const record = buildConsentLogRecord({ userId: user._id, point, now });
    const consentLogId = await ctx.db.insert("consentLogs", record);

    return {
      consentLogId,
      point: record.point,
      version: record.version,
      acknowledgedAt: record.acknowledgedAt,
    };
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("consentLogs")
      .withIndex("by_userId_deletedAt", (q) => q.eq("userId", user._id).eq("deletedAt", undefined))
      .collect();

    return [...rows].sort((a, b) => b.acknowledgedAt - a.acknowledgedAt);
  },
});

export const latestByPoint = query({
  args: {
    point: consentPointValidator,
  },
  handler: async (ctx, { point }) => {
    const user = await requireUser(ctx);
    const rows = await ctx.db
      .query("consentLogs")
      .withIndex("by_userId_point", (q) => q.eq("userId", user._id).eq("point", point))
      .collect();
    const activeRows = rows.filter((row) => row.deletedAt === undefined);
    activeRows.sort((a, b) => b.acknowledgedAt - a.acknowledgedAt);

    return activeRows[0] ?? null;
  },
});
