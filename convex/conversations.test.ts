import { describe, expect, test } from "bun:test";
import * as conversations from "./conversations";
import * as messages from "./messages";

type FakeIdentity = {
	subject: string;
	email?: string;
};

type FakeUser = {
	_id: string;
	email: string;
};

/**
 * Minimal in-memory Convex ctx. Mirrors the shape `convex/lib/requireUser.test.ts`
 * uses: `withIndex` callbacks only ever call `q.eq(field, value)` once, so the
 * matcher can resolve straight to an equality filter without modelling the
 * full Convex query builder.
 */
function makeFakeCtx({
	identity,
	users = [],
}: {
	identity: FakeIdentity | null;
	users?: FakeUser[];
}) {
	const tables = new Map<string, Map<string, Record<string, unknown>>>();
	let nextId = 1;

	function table(name: string) {
		let t = tables.get(name);
		if (!t) {
			t = new Map();
			tables.set(name, t);
		}
		return t;
	}

	for (const user of users) {
		table("users").set(user._id, user as unknown as Record<string, unknown>);
	}

	function matchQuery(rows: Record<string, unknown>[]) {
		return {
			withIndex: (
				_indexName: string,
				matcher: (q: { eq: (field: string, value: unknown) => { field: string; value: unknown } }) => {
					field: string;
					value: unknown;
				},
			) => {
				const { field, value } = matcher({ eq: (field, value) => ({ field, value }) });
				return matchQuery(rows.filter((row) => row[field] === value));
			},
			order: (_direction: "asc" | "desc") => matchQuery(rows),
			collect: async () => rows,
			first: async () => rows[0] ?? null,
			unique: async () => rows[0] ?? null,
		};
	}

	const db = {
		normalizeId: (tableName: string, id: string) => (table(tableName).has(id) ? id : null),
		get: async (id: string) => {
			const [tableName] = id.split(":");
			return table(tableName).get(id) ?? null;
		},
		insert: async (tableName: string, doc: Record<string, unknown>) => {
			const id = `${tableName}:${nextId++}`;
			table(tableName).set(id, { _id: id, ...doc });
			return id;
		},
		patch: async (id: string, patch: Record<string, unknown>) => {
			const [tableName] = id.split(":");
			const existing = table(tableName).get(id);
			table(tableName).set(id, { ...existing, ...patch });
		},
		delete: async (id: string) => {
			const [tableName] = id.split(":");
			table(tableName).delete(id);
		},
		query: (tableName: string) => matchQuery(Array.from(table(tableName).values())),
	};

	return {
		auth: { getUserIdentity: async () => identity },
		db,
	} as any;
}

describe("conversations and messages use requireUser", () => {
	test("conversations.list returns only the caller's rows", async () => {
		const userA = { _id: "users:a", email: "a@example.com" };
		const userB = { _id: "users:b", email: "b@example.com" };
		const ctx = makeFakeCtx({
			identity: { subject: `${userA._id}|session-a` },
			users: [userA, userB],
		});

		await ctx.db.insert("conversations", {
			userId: userA._id,
			title: "Mine",
			createdAt: 1,
			updatedAt: 1,
		});
		await ctx.db.insert("conversations", {
			userId: userB._id,
			title: "Not mine",
			createdAt: 1,
			updatedAt: 1,
		});

		const result = await (conversations.list as any)._handler(ctx, {});
		expect(result).toHaveLength(1);
		expect(result[0].userId).toBe(userA._id);
	});

	test("conversations.create inserts with the caller's _id", async () => {
		const userA = { _id: "users:a", email: "a@example.com" };
		const ctx = makeFakeCtx({
			identity: { subject: `${userA._id}|session-a` },
			users: [userA],
		});

		const conversationId = await (conversations.create as any)._handler(ctx, {
			title: "New chat",
		});

		const stored = await ctx.db.get(conversationId);
		expect(stored.userId).toBe(userA._id);
	});

	test("messages.list on another user's conversation throws access denied", async () => {
		const userA = { _id: "users:a", email: "a@example.com" };
		const userB = { _id: "users:b", email: "b@example.com" };
		const ctx = makeFakeCtx({
			identity: { subject: `${userA._id}|session-a` },
			users: [userA, userB],
		});

		const conversationId = await ctx.db.insert("conversations", {
			userId: userB._id,
			title: "Not mine",
			createdAt: 1,
			updatedAt: 1,
		});

		await expect(
			(messages.list as any)._handler(ctx, { conversationId }),
		).rejects.toThrow("Conversation not found or access denied");
	});

	test("conversations.list throws Not authenticated without an identity", async () => {
		const ctx = makeFakeCtx({ identity: null, users: [] });

		await expect((conversations.list as any)._handler(ctx, {})).rejects.toThrow(
			"Not authenticated",
		);
	});
});
