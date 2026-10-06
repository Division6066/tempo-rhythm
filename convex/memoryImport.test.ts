import { describe, expect, test } from "bun:test";
import * as memoryImport from "./memoryImport";

type Row = Record<string, unknown>;

function makeFakeCtx(signedIn = true) {
	const user = { _id: "users:a", email: "a@example.com" };
	const tables = new Map<string, Map<string, Row>>([["users", new Map([[user._id, user]])]]);
	let nextId = 1;
	const table = (name: string) => {
		let rows = tables.get(name);
		if (!rows) {
			rows = new Map();
			tables.set(name, rows);
		}
		return rows;
	};
	const query = (rows: Row[]) => ({
		withIndex: (_name: string, build: (q: unknown) => unknown) => {
			const filters: [string, unknown][] = [];
			const q = {
				eq: (field: string, value: unknown) => {
					filters.push([field, value]);
					return q;
				},
			};
			build(q);
			return query(rows.filter((row) => filters.every(([key, value]) => row[key] === value)));
		},
		collect: async () => rows,
	});
	const db = {
		normalizeId: (name: string, id: string) => (table(name).has(id) ? id : null),
		get: async (id: string) => table(id.split(":")[0] ?? "").get(id) ?? null,
		query: (name: string) => query(Array.from(table(name).values())),
		insert: async (name: string, doc: Row) => {
			const id = `${name}:${nextId++}`;
			table(name).set(id, { _id: id, ...doc });
			return id;
		},
	};
	return {
		ctx: {
			auth: { getUserIdentity: async () => (signedIn ? { subject: user._id } : null) },
			db,
		} as any,
		db,
	};
}

const run = (ctx: unknown, args: unknown) => (memoryImport.importMemories as any)._handler(ctx, args);

describe("importMemories", () => {
	test("refuses a signed-out user", async () => {
		const { ctx } = makeFakeCtx(false);
		await expect(run(ctx, { source: "chatgpt", text: "Likes tea" })).rejects.toThrow(
			"Not authenticated",
		);
	});

	test("stores source metadata and skips the same import", async () => {
		const { ctx, db } = makeFakeCtx();
		expect(await run(ctx, { source: "claude", text: "- Likes tea\n- Works remotely" })).toEqual({
			added: 2,
			skipped: 0,
		});
		expect(await run(ctx, { source: "claude", text: "likes tea\nWorks remotely" })).toEqual({
			added: 0,
			skipped: 2,
		});
		const rows = await db.query("memories").collect();
		expect(rows).toHaveLength(2);
		expect(rows[0]).toMatchObject({
			sector: "general",
			salience: 0.5,
			decayRate: 0.01,
			metadata: { source: "claude" },
		});
		expect(typeof (rows[0].metadata as Row).importedAt).toBe("number");
	});

	test("rejects text over one megabyte", async () => {
		const { ctx } = makeFakeCtx();
		await expect(
			run(ctx, { source: "other", text: "x".repeat(1024 * 1024 + 1) }),
		).rejects.toThrow("under 1 MB");
	});
});
