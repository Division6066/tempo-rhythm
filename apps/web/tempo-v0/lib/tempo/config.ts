/**
 * The only environment variable this app reads.
 * Live wiring swaps the adapter; it does not add keys here.
 */
export type AdapterName = "mock" | "live";

export function getDataAdapterName(): AdapterName {
  const fromProcess =
    typeof process !== "undefined" ? process.env?.DATA_ADAPTER : undefined;
  const fromVite =
    typeof import.meta !== "undefined"
      ? (import.meta as ImportMeta & { env?: Record<string, string> }).env?.DATA_ADAPTER
      : undefined;
  const value = (fromProcess ?? fromVite ?? "mock").toLowerCase();
  return value === "live" ? "live" : "mock";
}

export const MOCK_USER_ID = "user_mock_tempo";
export const STORAGE_KEY = "tempo-v0-mock-state";
