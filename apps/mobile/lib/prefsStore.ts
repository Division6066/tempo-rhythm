import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export type LanguagePreference = "en" | "he";

export type Prefs = {
  language: LanguagePreference;
};

export const prefsStorageKey = "tempo:prefs:v1";

const defaultPrefs: Prefs = {
  language: "en",
};

function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === "en" || value === "he";
}

function normalizePrefs(value: unknown): Prefs {
  if (typeof value !== "object" || value === null || !("language" in value)) {
    return defaultPrefs;
  }

  const language = (value as { language: unknown }).language;
  return {
    language: isLanguagePreference(language) ? language : defaultPrefs.language,
  };
}

function parsePrefs(rawValue: string | null): Prefs {
  if (!rawValue) {
    return defaultPrefs;
  }

  try {
    return normalizePrefs(JSON.parse(rawValue));
  } catch {
    return defaultPrefs;
  }
}

function readWebPrefs(): Prefs {
  try {
    return parsePrefs(globalThis.localStorage?.getItem(prefsStorageKey) ?? null);
  } catch {
    return defaultPrefs;
  }
}

function writeWebPrefs(prefs: Prefs): void {
  try {
    globalThis.localStorage?.setItem(prefsStorageKey, JSON.stringify(prefs));
  } catch {
    // Preferences are nice-to-have; keep the screen usable if storage is blocked.
  }
}

export async function getPrefs(): Promise<Prefs> {
  if (Platform.OS === "web") {
    return readWebPrefs();
  }

  try {
    return parsePrefs(await AsyncStorage.getItem(prefsStorageKey));
  } catch {
    return defaultPrefs;
  }
}

export async function setPrefs(nextPrefs: Partial<Prefs>): Promise<Prefs> {
  const prefs = normalizePrefs({
    ...(await getPrefs()),
    ...nextPrefs,
  });
  const serializedPrefs = JSON.stringify(prefs);

  if (Platform.OS === "web") {
    writeWebPrefs(prefs);
    return prefs;
  }

  try {
    await AsyncStorage.setItem(prefsStorageKey, serializedPrefs);
  } catch {
    // Preferences are non-sensitive local state; ignore storage failures.
  }

  return prefs;
}
