import { v } from "convex/values";
import { mutation, query, internalMutation, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "./_helpers";

const tierValidator = v.union(
  v.literal("basic"),
  v.literal("pro"),
  v.literal("max")
);

const statusValidator = v.union(
  v.literal("inactive"),
  v.literal("trialing"),
  v.literal("active"),
  v.literal("past_due"),
  v.literal("cancelled"),
  v.literal("expired")
);

type Tier = "basic" | "pro" | "max";
type SubscriptionStatus =
  | "inactive"
  | "trialing"
  | "active"
  | "past_due"
  | "cancelled"
  | "expired";

function normalizeTier(raw?: string | null): Tier {
  switch ((raw ?? "").toLowerCase()) {
    case "max":
      return "max";
    case "pro":
      return "pro";
    default:
      return "basic";
  }
}

function normalizeStatus(raw?: string | null): SubscriptionStatus {
  switch ((raw ?? "").toLowerCase()) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "billing_issue":
      return "past_due";
    case "cancelled":
      return "cancelled";
    case "expired":
      return "expired";
    default:
      return "inactive";
  }
}

export const get = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    return await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const record = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    return record ? [record] : [];
  },
});

export const upsert = mutation({
  args: {
    tier: tierValidator,
    status: statusValidator,
    revenueCatCustomerId: v.optional(v.string()),
    revenueCatProductId: v.optional(v.string()),
    revenueCatEntitlementId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    return await upsertByUserIdInternal(ctx, {
      userId,
      ...args,
      source: "manual",
      rawEvent: null,
    });
  },
});

export const remove = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const existing = await ctx.db
      .query("subscriptions")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();
    if (existing) {
      await ctx.db.delete(existing._id);
    }
  },
});

export const syncFromRevenueCat = internalMutation({
  args: {
    userId: v.string(),
    tier: v.optional(v.string()),
    status: v.optional(v.string()),
    revenueCatCustomerId: v.optional(v.string()),
    revenueCatProductId: v.optional(v.string()),
    revenueCatEntitlementId: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
    source: v.string(),
    rawEvent: v.any(),
  },
  handler: async (ctx, args) => {
    return await upsertByUserIdInternal(ctx, {
      userId: args.userId,
      tier: normalizeTier(args.tier),
      status: normalizeStatus(args.status),
      revenueCatCustomerId: args.revenueCatCustomerId,
      revenueCatProductId: args.revenueCatProductId,
      revenueCatEntitlementId: args.revenueCatEntitlementId,
      expiresAt: args.expiresAt,
      cancelledAt: args.cancelledAt,
      source: args.source,
      rawEvent: args.rawEvent,
    });
  },
});

export const applyRevenueCatEvent = internalMutation({
  args: {
    payload: v.any(),
  },
  handler: async (ctx, { payload }) => {
    const event = payload && typeof payload === "object" && "event" in (payload as Record<string, unknown>)
      ? (payload as Record<string, any>).event ?? payload
      : payload;

    const appUserId =
      typeof event?.app_user_id === "string" && event.app_user_id.length > 0
        ? event.app_user_id
        : typeof event?.aliases?.[0] === "string"
          ? event.aliases[0]
          : typeof event?.original_app_user_id === "string"
            ? event.original_app_user_id
            : undefined;

    if (!appUserId) {
      return { ok: false, reason: "missing_app_user_id" };
    }

    const eventType = typeof event?.type === "string" ? event.type : "unknown";
    const expirationAtMs = toTimestamp(event?.expiration_at_ms ?? event?.expires_date_ms);
    const cancellationAtMs = toTimestamp(event?.cancelled_at_ms ?? event?.cancellation_date_ms);

    await upsertByUserIdInternal(ctx, {
      userId: appUserId,
      tier: normalizeTier(
        event?.entitlement_id ??
          event?.product_id ??
          event?.presented_offering_id
      ),
      status: normalizeStatus(eventType),
      revenueCatCustomerId:
        typeof event?.original_transaction_id === "string"
          ? event.original_transaction_id
          : undefined,
      revenueCatAppUserId: appUserId,
      revenueCatProductId:
        typeof event?.product_id === "string" ? event.product_id : undefined,
      revenueCatEntitlementId:
        typeof event?.entitlement_id === "string" ? event.entitlement_id : undefined,
      expiresAt: expirationAtMs,
      platform: typeof event?.store === "string" ? event.store : undefined,
      environment:
        typeof event?.environment === "string" ? event.environment : undefined,
      eventType,
      lastEventId:
        typeof event?.id === "string"
          ? event.id
          : typeof event?.transaction_id === "string"
            ? event.transaction_id
            : undefined,
      cancelledAt: cancellationAtMs,
      source: "revenuecat-webhook",
      rawEvent: payload,
    });

    return { ok: true, eventType, userId: appUserId };
  },
});

async function upsertByUserIdInternal(
  ctx: MutationCtx,
  args: {
    userId: string;
    tier: Tier;
    status: SubscriptionStatus;
    revenueCatCustomerId?: string;
    revenueCatAppUserId?: string;
    revenueCatProductId?: string;
    revenueCatEntitlementId?: string;
    expiresAt?: number;
    platform?: string;
    environment?: string;
    eventType?: string;
    lastEventId?: string;
    cancelledAt?: number;
    source: string;
    rawEvent: unknown;
  }
) {
  const existing = await ctx.db
    .query("subscriptions")
    .withIndex("by_userId", (q: any) => q.eq("userId", args.userId))
    .unique();
  const now = Date.now();
  const payload = {
    userId: args.userId,
    revenueCatCustomerId: args.revenueCatCustomerId,
    revenueCatAppUserId: args.revenueCatAppUserId,
    revenueCatProductId: args.revenueCatProductId,
    revenueCatEntitlementId: args.revenueCatEntitlementId,
    tier: args.tier,
    status: args.status,
    platform: args.platform,
    environment: args.environment,
    expiresAt: args.expiresAt,
    eventType: args.eventType,
    lastEventId: args.lastEventId,
    cancelledAt: args.cancelledAt,
    updatedAt: now,
  };

  if (existing) {
    await ctx.db.patch(existing._id, payload);
    return existing._id;
  }

  return await ctx.db.insert("subscriptions", {
    ...payload,
    createdAt: now,
  });
}

function toTimestamp(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}
