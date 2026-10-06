import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import {
	AiAuthError,
	AiContextTooLargeError,
	AiRateLimitedError,
	AiUpstreamError,
} from "./ai_errors";
import { callLLM, TIER_MODEL } from "./ai_router";

const originalFetch = globalThis.fetch;
const TRACKED = [
	"AI_PROVIDER",
	"AI_MODEL",
	"AI_API_KEY",
	"AI_CHAT_API_KEY",
	"AI_CHAT_BASE_URL",
	"AI_CHAT_MODEL",
	"MISTRAL_API_KEY",
] as const;

function jsonResponse(body: unknown, init?: ResponseInit): Response {
	return new Response(JSON.stringify(body), {
		status: 200,
		headers: { "Content-Type": "application/json" },
		...init,
	});
}

function errorResponse(
	status: number,
	body: string,
	headers?: HeadersInit,
): Response {
	return new Response(body, { status, headers });
}

function successBody(content = "ok") {
	return {
		choices: [{ message: { content } }],
		usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
	};
}

beforeEach(() => {
	for (const name of TRACKED) {
		delete process.env[name];
	}
	process.env.MISTRAL_API_KEY = "test-key";
});

afterEach(() => {
	globalThis.fetch = originalFetch;
	for (const name of TRACKED) {
		delete process.env[name];
	}
});

describe("callLLM", () => {
	test("throws AiAuthError when every chat key is absent", async () => {
		delete process.env.MISTRAL_API_KEY;
		await expect(
			callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
		).rejects.toBeInstanceOf(AiAuthError);
	});

	test("POSTs to the resolved OpenAI-compatible chat URL", async () => {
		process.env.AI_PROVIDER = "inkling";
		process.env.AI_CHAT_API_KEY = "chat-key";
		process.env.AI_CHAT_BASE_URL = "https://api.inkling.example/v1";
		process.env.AI_CHAT_MODEL = "inkling-chat";

		let capturedUrl = "";
		let capturedAuth = "";
		let capturedBody: { model?: string; safe_prompt?: boolean } = {};
		globalThis.fetch = mock((input: RequestInfo | URL, init?: RequestInit) => {
			capturedUrl = String(input);
			capturedAuth = new Headers(init?.headers).get("Authorization") ?? "";
			capturedBody = JSON.parse(String(init?.body ?? "{}")) as typeof capturedBody;
			return Promise.resolve(jsonResponse(successBody("pong")));
		});

		const result = await callLLM({
			tier: "fast",
			messages: [{ role: "user", content: "ping" }],
		});

		expect(capturedUrl).toBe("https://api.inkling.example/v1/chat/completions");
		expect(capturedAuth).toBe("Bearer chat-key");
		expect(capturedBody.model).toBe("inkling-chat");
		expect(capturedBody.safe_prompt).toBeUndefined();
		expect(result.content).toBe("pong");
		expect(result.model).toBe("inkling-chat");
	});

	test("returns parsed content on success", async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(jsonResponse(successBody('{"plan":true}'))),
		);

		const result = await callLLM({
			tier: "fast",
			messages: [{ role: "user", content: "hi" }],
			responseFormat: "json_object",
		});

		expect(result.content).toBe('{"plan":true}');
		expect(result.tier).toBe("fast");
		expect(result.model).toBe(TIER_MODEL.fast);
		expect(result.escalated).toBe(false);
		expect(result.usage.totalTokens).toBe(15);
	});

	test("throws AiAuthError on HTTP 401 without retrying", async () => {
		const fetchMock = mock(() =>
			Promise.resolve(errorResponse(401, "bad key")),
		);
		globalThis.fetch = fetchMock;

		await expect(
			callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
		).rejects.toBeInstanceOf(AiAuthError);

		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	test("retries once on HTTP 429 then succeeds", async () => {
		const fetchMock = mock(() =>
			Promise.resolve(errorResponse(429, "slow down", { "Retry-After": "1" })),
		)
			.mockImplementationOnce(() =>
				Promise.resolve(
					errorResponse(429, "slow down", { "Retry-After": "1" }),
				),
			)
			.mockImplementationOnce(() =>
				Promise.resolve(jsonResponse(successBody("done"))),
			);

		globalThis.fetch = fetchMock;

		const result = await callLLM({
			tier: "balanced",
			messages: [{ role: "user", content: "hi" }],
		});

		expect(result.content).toBe("done");
		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	test("throws AiRateLimitedError after two 429 responses", async () => {
		const fetchMock = mock(() =>
			Promise.resolve(errorResponse(429, "slow down")),
		);
		globalThis.fetch = fetchMock;

		await expect(
			callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
		).rejects.toBeInstanceOf(AiRateLimitedError);

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});

	test("escalates to balanced tier when fast tier hits context limit", async () => {
		const fetchMock = mock(
			(_url: string | URL | Request, init?: RequestInit) => {
				const body = JSON.parse(String(init?.body)) as { model: string };
				if (body.model === TIER_MODEL.fast) {
					return Promise.resolve(
						errorResponse(
							400,
							JSON.stringify({ error: "context_length_exceeded" }),
						),
					);
				}
				return Promise.resolve(jsonResponse(successBody("escalated")));
			},
		);
		globalThis.fetch = fetchMock;

		const result = await callLLM({
			tier: "fast",
			messages: [{ role: "user", content: "big" }],
		});

		expect(result.content).toBe("escalated");
		expect(result.tier).toBe("balanced");
		expect(result.escalated).toBe(true);
	});

	test("throws AiContextTooLargeError when deep tier still exceeds context", async () => {
		globalThis.fetch = mock(() =>
			Promise.resolve(
				errorResponse(400, "maximum context length exceeded for this model"),
			),
		);

		await expect(
			callLLM({ tier: "deep", messages: [{ role: "user", content: "huge" }] }),
		).rejects.toBeInstanceOf(AiContextTooLargeError);
	});

	test("retries once on HTTP 503 then surfaces AiUpstreamError", async () => {
		const fetchMock = mock(() =>
			Promise.resolve(errorResponse(503, "unavailable")),
		);
		globalThis.fetch = fetchMock;

		await expect(
			callLLM({ tier: "fast", messages: [{ role: "user", content: "hi" }] }),
		).rejects.toBeInstanceOf(AiUpstreamError);

		expect(fetchMock).toHaveBeenCalledTimes(2);
	});
});
