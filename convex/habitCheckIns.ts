import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { type MutationCtx, mutation, query } from "./_generated/server";
import { computeHabitCheckInStreaks, isLocalDate } from "./lib/habitCheckInStreak";
import { requireUser } from "./lib/requireUser";

const checkInValidator = v.object({
	_id: v.id("habitCheckIns"),
	_creationTime: v.number(),
	userId: v.id("users"),
	habitId: v.id("habits"),
	localDate: v.string(),
	checkedAt: v.number(),
	source: v.union(
		v.literal("habits"),
		v.literal("today"),
		v.literal("suggestion"),
		v.literal("legacy"),
	),
	note: v.optional(v.string()),
	createdAt: v.number(),
	updatedAt: v.number(),
	deletedAt: v.optional(v.number()),
});

async function getOwnedHabit(
	ctx: MutationCtx,
	userId: Id<"users">,
	habitId: Id<"habits">,
): Promise<Doc<"habits">> {
	const habit = await ctx.db.get(habitId);
	if (!habit || habit.userId !== userId || habit.deletedAt !== undefined) {
		throw new Error("Habit not found");
	}
	return habit;
}

async function liveCheckInsForHabit(ctx: MutationCtx, habitId: Id<"habits">) {
	return ctx.db
		.query("habitCheckIns")
		.withIndex("by_habitId_deletedAt_localDate", (q) =>
			q.eq("habitId", habitId).eq("deletedAt", undefined),
		)
		.collect();
}

/** Recompute and patch the habit's streak cache from its live check-ins. */
async function refreshHabitCache(ctx: MutationCtx, habit: Doc<"habits">, asOfLocalDate: string) {
	const rows = await liveCheckInsForHabit(ctx, habit._id);
	const streaks = computeHabitCheckInStreaks(
		rows.map((r) => r.localDate),
		asOfLocalDate,
	);
	const latest = rows.reduce<number | undefined>(
		(max, r) => (max === undefined || r.checkedAt > max ? r.checkedAt : max),
		undefined,
	);
	await ctx.db.patch(habit._id, {
		currentStreak: streaks.currentStreak,
		longestStreak: streaks.longestStreak,
		lastCompletedAt: latest,
		updatedAt: Date.now(),
	});
	return streaks;
}

export const listForDate = query({
	args: { localDate: v.string() },
	returns: v.array(checkInValidator),
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		return ctx.db
			.query("habitCheckIns")
			.withIndex("by_userId_deletedAt_localDate", (q) =>
				q.eq("userId", user._id).eq("deletedAt", undefined).eq("localDate", args.localDate),
			)
			.collect();
	},
});

export const listForHabit = query({
	args: {
		habitId: v.id("habits"),
		fromLocalDate: v.string(),
		toLocalDate: v.string(),
	},
	returns: v.array(checkInValidator),
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		const habit = await ctx.db.get(args.habitId);
		if (!habit || habit.userId !== user._id || habit.deletedAt !== undefined) {
			return [];
		}
		return ctx.db
			.query("habitCheckIns")
			.withIndex("by_habitId_deletedAt_localDate", (q) =>
				q
					.eq("habitId", args.habitId)
					.eq("deletedAt", undefined)
					.gte("localDate", args.fromLocalDate)
					.lte("localDate", args.toLocalDate),
			)
			.order("asc")
			.collect();
	},
});

export const check = mutation({
	args: {
		habitId: v.id("habits"),
		localDate: v.string(),
		source: v.union(v.literal("habits"), v.literal("today"), v.literal("suggestion")),
		note: v.optional(v.string()),
	},
	returns: v.object({
		checkInId: v.id("habitCheckIns"),
		alreadyChecked: v.boolean(),
		currentStreak: v.number(),
		longestStreak: v.number(),
	}),
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		if (!isLocalDate(args.localDate)) {
			throw new Error("localDate must be YYYY-MM-DD");
		}
		const habit = await getOwnedHabit(ctx, user._id, args.habitId);

		const existing = (await liveCheckInsForHabit(ctx, habit._id)).find(
			(r) => r.localDate === args.localDate,
		);
		if (existing) {
			return {
				checkInId: existing._id,
				alreadyChecked: true,
				currentStreak: habit.currentStreak,
				longestStreak: habit.longestStreak,
			};
		}

		const now = Date.now();
		const note = args.note?.trim();
		const checkInId = await ctx.db.insert("habitCheckIns", {
			userId: user._id,
			habitId: habit._id,
			localDate: args.localDate,
			checkedAt: now,
			source: args.source,
			...(note ? { note } : {}),
			createdAt: now,
			updatedAt: now,
		});
		const streaks = await refreshHabitCache(ctx, habit, args.localDate);
		return {
			checkInId,
			alreadyChecked: false,
			currentStreak: streaks.currentStreak,
			longestStreak: streaks.longestStreak,
		};
	},
});

export const undo = mutation({
	args: { habitId: v.id("habits"), localDate: v.string() },
	returns: v.object({
		removed: v.boolean(),
		currentStreak: v.number(),
		longestStreak: v.number(),
	}),
	handler: async (ctx, args) => {
		const user = await requireUser(ctx);
		if (!isLocalDate(args.localDate)) {
			throw new Error("localDate must be YYYY-MM-DD");
		}
		const habit = await getOwnedHabit(ctx, user._id, args.habitId);

		const existing = (await liveCheckInsForHabit(ctx, habit._id)).find(
			(r) => r.localDate === args.localDate,
		);
		if (!existing) {
			return {
				removed: false,
				currentStreak: habit.currentStreak,
				longestStreak: habit.longestStreak,
			};
		}

		const now = Date.now();
		await ctx.db.patch(existing._id, { deletedAt: now, updatedAt: now });
		const streaks = await refreshHabitCache(ctx, habit, args.localDate);
		return {
			removed: true,
			currentStreak: streaks.currentStreak,
			longestStreak: streaks.longestStreak,
		};
	},
});
