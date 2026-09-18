import { liveAdapter, type TempoAdapter } from "./adapter";
import { getDataAdapterName } from "./config";
import { mockAdapter, mockStore } from "./mock";

export function getAdapter(): TempoAdapter {
  return getDataAdapterName() === "live" ? liveAdapter : mockAdapter;
}

export { getDataAdapterName } from "./config";
export { mockAdapter, mockStore } from "./mock";
export { liveAdapter } from "./adapter";
export type { TempoAdapter } from "./adapter";
