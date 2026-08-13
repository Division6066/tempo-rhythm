import { afterEach, describe, expect, test } from "bun:test";
import { AiEnvError } from "../errors";
import {
  resetLegacyWarningForTests,
  resolveApiKey,
  resolveModelForModality,
  resolveProviderForModality,
} from "./index";

const MANAGED_VARS = [
  "AI_CHAT_PROVIDER",
  "AI_CHAT_MODEL",
  "AI_CHAT_API_KEY",
  "AI_STT_PROVIDER",
  "AI_STT_MODEL",
  "AI_STT_API_KEY",
  "AI_TTS_MODEL",
  "AI_PROVIDER",
  "AI_MODEL",
  "AI_API_KEY",
  "MISTRAL_API_KEY",
  "DEEPGRAM_API_KEY",
] as const;

afterEach(() => {
  for (const name of MANAGED_VARS) {
    delete process.env[name];
  }
  resetLegacyWarningForTests();
});

describe("resolveProviderForModality", () => {
  test("defaults: chat→mistral, stt→deepgram, tts→deepgram, embeddings→mistral", () => {
    expect(resolveProviderForModality("chat").id).toBe("mistral");
    expect(resolveProviderForModality("stt").id).toBe("deepgram");
    expect(resolveProviderForModality("tts").id).toBe("deepgram");
    expect(resolveProviderForModality("embeddings").id).toBe("mistral");
  });

  test("AI_STT_PROVIDER overrides the default", () => {
    process.env.AI_STT_PROVIDER = "mistral";
    expect(resolveProviderForModality("stt").id).toBe("mistral");
  });

  test("legacy AI_PROVIDER still selects the chat provider", () => {
    process.env.AI_PROVIDER = "deepgram";
    expect(resolveProviderForModality("chat").id).toBe("deepgram");
  });

  test("unknown provider names throw AiEnvError naming the variable", () => {
    process.env.AI_STT_PROVIDER = "definitely-not-a-provider";
    try {
      resolveProviderForModality("stt");
      throw new Error("expected a throw");
    } catch (err) {
      const error = err as AiEnvError;
      expect(error.name).toBe("AiEnvError");
      expect(error.message).toContain("AI_STT_PROVIDER");
    }
  });

  test("the sentinel placeholder counts as unset", () => {
    process.env.AI_STT_PROVIDER = "__DUMMY_PASTE_ME__";
    expect(resolveProviderForModality("stt").id).toBe("deepgram");
  });
});

describe("resolveModelForModality", () => {
  test("stt defaults to nova-3, tts to aura-2", () => {
    expect(resolveModelForModality("stt")).toBe("nova-3");
    expect(resolveModelForModality("tts")).toBe("aura-2");
  });
  test("AI_STT_MODEL overrides the default", () => {
    process.env.AI_STT_MODEL = "nova-3-multilingual";
    expect(resolveModelForModality("stt")).toBe("nova-3-multilingual");
  });
  test("legacy AI_MODEL feeds chat only", () => {
    process.env.AI_MODEL = "mistral-large-latest";
    expect(resolveModelForModality("chat")).toBe("mistral-large-latest");
    expect(resolveModelForModality("stt")).toBe("nova-3");
  });
});

describe("resolveApiKey resolution order", () => {
  test("BYOK key wins over everything", () => {
    process.env.AI_STT_API_KEY = "env-modality-key";
    process.env.DEEPGRAM_API_KEY = "env-native-key";
    const resolved = resolveApiKey("stt", { byokKey: "user-key" });
    expect(resolved).toEqual({
      provider: "deepgram",
      apiKey: "user-key",
      source: "byok",
    });
  });

  test("modality key beats native key", () => {
    process.env.AI_STT_API_KEY = "env-modality-key";
    process.env.DEEPGRAM_API_KEY = "env-native-key";
    expect(resolveApiKey("stt").apiKey).toBe("env-modality-key");
  });

  test("legacy AI_API_KEY still serves chat", () => {
    process.env.AI_API_KEY = "legacy-chat-key";
    const resolved = resolveApiKey("chat");
    expect(resolved.apiKey).toBe("legacy-chat-key");
    expect(resolved.source).toBe("env");
  });

  test("legacy AI_API_KEY does NOT serve stt", () => {
    process.env.AI_API_KEY = "legacy-chat-key";
    process.env.DEEPGRAM_API_KEY = "env-native-key";
    expect(resolveApiKey("stt").apiKey).toBe("env-native-key");
  });

  test("native provider key is the final fallback", () => {
    process.env.MISTRAL_API_KEY = "native-mistral";
    expect(resolveApiKey("chat").apiKey).toBe("native-mistral");
  });

  test("nothing configured → AiEnvError listing consulted variables, never values", () => {
    try {
      resolveApiKey("stt");
      throw new Error("expected a throw");
    } catch (err) {
      const error = err as AiEnvError;
      expect(error.name).toBe("AiEnvError");
      expect(error.message).toContain("AI_STT_API_KEY");
      expect(error.message).toContain("DEEPGRAM_API_KEY");
    }
  });

  test("sentinel-valued keys are treated as absent", () => {
    process.env.AI_STT_API_KEY = "__DUMMY_PASTE_ME__";
    process.env.DEEPGRAM_API_KEY = "real-key";
    expect(resolveApiKey("stt").apiKey).toBe("real-key");
  });
});
