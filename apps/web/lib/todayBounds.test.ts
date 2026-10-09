import { describe, expect, test } from "bun:test";
import { spawnSync } from "node:child_process";
import { getLocalDayBoundsMs, nextLocalDayRolloverDelayMs } from "./todayBounds";

const DAY_MS = 24 * 60 * 60 * 1000;
const moduleUrl = new URL("./todayBounds.ts", import.meta.url).href;
const hookModuleUrl = new URL("./useLocalDayBounds.ts", import.meta.url).href;

function runInTimezone<T>(timezone: string, expression: string): T {
  const script = `
    import { getLocalDayBoundsMs, nextLocalDayRolloverDelayMs } from ${JSON.stringify(moduleUrl)};
    const value = (${expression})();
    console.log(JSON.stringify(value));
  `;
  const result = spawnSync(process.execPath, ["-e", script], {
    env: { ...process.env, TZ: timezone },
    stdio: "pipe",
  });
  expect(result.status, result.stderr.toString()).toBe(0);
  return JSON.parse(result.stdout.toString()) as T;
}

describe("getLocalDayBoundsMs", () => {
  test("uses the next New York calendar midnight across both DST transitions", () => {
    const fixtures = runInTimezone<
      Array<{ label: string; duration: number; startOffset: number; endOffset: number }>
    >(
      "America/New_York",
      `() => [
        ["spring", new Date(2026, 2, 8, 12)],
        ["ordinary", new Date(2026, 3, 15, 12)],
        ["fall", new Date(2026, 10, 1, 12)],
      ].map(([label, instant]) => {
        const { startMs, endMs } = getLocalDayBoundsMs(instant);
        return {
          label,
          duration: endMs - startMs,
          startOffset: new Date(startMs).getTimezoneOffset(),
          endOffset: new Date(endMs).getTimezoneOffset(),
        };
      })`,
    );

    expect(fixtures).toEqual([
      { label: "spring", duration: 23 * 60 * 60 * 1000, startOffset: 300, endOffset: 240 },
      { label: "ordinary", duration: DAY_MS, startOffset: 240, endOffset: 240 },
      { label: "fall", duration: 25 * 60 * 60 * 1000, startOffset: 240, endOffset: 300 },
    ]);
  });

  test("keeps ordinary dates 24 hours in a non-DST timezone", () => {
    const fixture = runInTimezone<{ duration: number; offset: number }>(
      "Asia/Kolkata",
      `() => {
        const bounds = getLocalDayBoundsMs(new Date(2026, 3, 15, 12));
        return { duration: bounds.endMs - bounds.startMs, offset: new Date(bounds.startMs).getTimezoneOffset() };
      }`,
    );
    expect(fixture).toEqual({ duration: DAY_MS, offset: -330 });
  });

  test("handles month, year, and leap-day boundaries as adjacent windows", () => {
    for (const [year, month, date, nextYear, nextMonth, nextDate] of [
      [2024, 1, 29, 2024, 2, 1],
      [2026, 3, 30, 2026, 4, 1],
      [2026, 11, 31, 2027, 0, 1],
    ]) {
      const current = getLocalDayBoundsMs(new Date(year, month, date, 12));
      const next = getLocalDayBoundsMs(new Date(nextYear, nextMonth, nextDate, 12));
      expect(current.endMs).toBe(next.startMs);
    }
  });

  test("selects the correct half-open window immediately around midnight", () => {
    const midnight = new Date(2026, 3, 16).getTime();
    const before = getLocalDayBoundsMs(new Date(midnight - 1));
    const at = getLocalDayBoundsMs(new Date(midnight));
    const after = getLocalDayBoundsMs(new Date(midnight + 1));

    expect(before.endMs).toBe(midnight);
    expect(at.startMs).toBe(midnight);
    expect(after).toEqual(at);
    expect(midnight - 1).toBeGreaterThanOrEqual(before.startMs);
    expect(midnight - 1).toBeLessThan(before.endMs);
    expect(midnight).not.toBeLessThan(before.endMs);
    expect(at.endMs).toBe(getLocalDayBoundsMs(new Date(at.endMs)).startMs);
  });
});

describe("nextLocalDayRolloverDelayMs", () => {
  test("returns the exact delay to the next calendar midnight plus its cushion", () => {
    const now = new Date(2026, 3, 15, 14, 30, 12, 345).getTime();
    expect(nextLocalDayRolloverDelayMs(now)).toBe(
      getLocalDayBoundsMs(new Date(now)).endMs - now + 50,
    );
  });

  test("does not prematurely rearm during the late repeated-hour fall-back day", () => {
    const fixture = runInTimezone<{ delay: number; expected: number; offset: number }>(
      "America/New_York",
      `() => {
        const now = new Date(2026, 10, 1, 23, 30).getTime();
        return {
          delay: nextLocalDayRolloverDelayMs(now),
          expected: new Date(2026, 10, 2).getTime() - now + 50,
          offset: new Date(now).getTimezoneOffset(),
        };
      }`,
    );
    expect(fixture).toEqual({ delay: 30 * 60 * 1000 + 50, expected: 30 * 60 * 1000 + 50, offset: 300 });
    expect(fixture.delay).toBeGreaterThan(50);
  });

  test("at midnight schedules the following midnight rather than a rapid loop", () => {
    const midnight = new Date(2026, 3, 16).getTime();
    expect(nextLocalDayRolloverDelayMs(midnight)).toBe(DAY_MS + 50);
  });
});

describe("useLocalDayBounds lifecycle", () => {
  test("exercises production effects with one replaceable timer and complete cleanup", () => {
    const script = `
      import { mock } from "bun:test";
      let effect;
      let state;
      let updates = 0;
      mock.module("react", () => ({
        useState(initializer) {
          state = initializer();
          return [state, (update) => {
            const next = typeof update === "function" ? update(state) : update;
            if (next !== state) { state = next; updates += 1; }
          }];
        },
        useEffect(callback) { effect = callback; },
      }));

      class Target {
        listeners = new Map();
        addEventListener(type, callback) { this.listeners.set(type, callback); }
        removeEventListener(type, callback) {
          if (this.listeners.get(type) === callback) this.listeners.delete(type);
        }
        dispatch(type) { this.listeners.get(type)?.(); }
      }
      const documentTarget = new Target();
      documentTarget.hidden = false;
      const windowTarget = new Target();
      globalThis.document = documentTarget;
      globalThis.window = windowTarget;

      const NativeDate = Date;
      let now = new NativeDate(2026, 2, 8, 12).getTime();
      globalThis.Date = class extends NativeDate {
        constructor(...args) { super(...(args.length === 0 ? [now] : args)); }
        static now() { return now; }
      };
      let nextTimerId = 1;
      const timers = new Map();
      const timerCallbacks = [];
      const cleared = [];
      globalThis.setTimeout = (callback, delay) => {
        const id = nextTimerId++;
        timers.set(id, { callback, delay });
        timerCallbacks.push(callback);
        return id;
      };
      globalThis.clearTimeout = (id) => { cleared.push(id); timers.delete(id); };

      const assertSingleTimer = (expectedDelay, label) => {
        if (timers.size > 1) throw new Error(label + " left more than one pending timer");
        if (timers.size !== 1 || [...timers.values()][0].delay !== expectedDelay) {
          throw new Error(label + " did not install the exact replacement delay");
        }
      };

      const { useLocalDayBounds } = await import(${JSON.stringify(hookModuleUrl)});
      const returned = useLocalDayBounds();
      if (!effect || returned.startMs !== state.startMs) throw new Error("hook did not initialize");
      const cleanup = effect();
      const initialStart = new Date(2026, 2, 8).getTime();
      const initialEnd = new Date(2026, 2, 9).getTime();
      const initialOffsets = [new Date(initialStart).getTimezoneOffset(), new Date(initialEnd).getTimezoneOffset()];
      if (initialOffsets[0] !== 300 || initialOffsets[1] !== 240) {
        throw new Error("New York fixture offsets unavailable");
      }
      if (state.startMs !== initialStart || state.endMs !== initialEnd) throw new Error("initial DST bounds");
      assertSingleTimer(initialEnd - now + 50, "initial mount");
      const first = [...timers.entries()][0];

      documentTarget.hidden = true;
      documentTarget.dispatch("visibilitychange");
      if (timers.size !== 1 || cleared.length !== 0) throw new Error("hidden event changed timer");

      documentTarget.hidden = false;
      now = new Date(2026, 2, 9, 8).getTime();
      documentTarget.dispatch("visibilitychange");
      if (timers.size !== 1 || !cleared.includes(first[0]) || state.startMs !== new Date(2026, 2, 9).getTime()) {
        throw new Error("visible refresh did not replace timer with current clock");
      }
      assertSingleTimer(new Date(2026, 2, 10).getTime() - now + 50, "first visible resume");

      const beforeFocusId = [...timers.keys()][0];
      windowTarget.dispatch("focus");
      if (timers.size !== 1 || !cleared.includes(beforeFocusId)) throw new Error("focus duplicated timer");
      assertSingleTimer(new Date(2026, 2, 10).getTime() - now + 50, "first focus");

      process.env.TZ = "Asia/Kolkata";
      now = new Date(2026, 3, 15, 12, 34, 56, 789).getTime();
      const changedStart = new Date(2026, 3, 15).getTime();
      const changedEnd = new Date(2026, 3, 16).getTime();
      if (new Date(changedStart).getTimezoneOffset() !== -330 || new Date(changedEnd).getTimezoneOffset() !== -330) {
        throw new Error("runtime timezone change fixture unavailable");
      }

      for (let index = 0; index < 2; index += 1) {
        const focusTimerId = [...timers.keys()][0];
        windowTarget.dispatch("focus");
        if (!cleared.includes(focusTimerId)) throw new Error("repeated focus did not replace timer");
        if (state.startMs !== changedStart || state.endMs !== changedEnd) {
          throw new Error("timezone change did not update both calendar endpoints");
        }
        assertSingleTimer(changedEnd - now + 50, "repeated focus " + index);

        documentTarget.hidden = true;
        documentTarget.dispatch("visibilitychange");
        assertSingleTimer(changedEnd - now + 50, "hidden pause " + index);
        documentTarget.hidden = false;
        const resumeTimerId = [...timers.keys()][0];
        documentTarget.dispatch("visibilitychange");
        if (!cleared.includes(resumeTimerId)) throw new Error("repeated resume did not replace timer");
        assertSingleTimer(changedEnd - now + 50, "repeated visible resume " + index);
      }

      const firing = [...timers.entries()][0];
      now = new Date(2026, 3, 16, 0, 0, 0, 50).getTime();
      timers.delete(firing[0]);
      firing[1].callback();
      if (state.startMs !== changedEnd || state.endMs !== new Date(2026, 3, 17).getTime()) {
        throw new Error("tick did not update both endpoints");
      }
      assertSingleTimer(new Date(2026, 3, 17).getTime() - now + 50, "timer tick");

      const updatesBeforeCleanup = updates;
      cleanup();
      if (timers.size !== 0 || documentTarget.listeners.size !== 0 || windowTarget.listeners.size !== 0) {
        throw new Error("cleanup incomplete");
      }
      for (const callback of timerCallbacks) callback();
      if (updates !== updatesBeforeCleanup || timers.size !== 0) throw new Error("cancelled callback updated or rearmed");
      console.log(JSON.stringify({
        updates,
        cleared: cleared.length,
        initialOffsets,
        changedOffsets: [new NativeDate(changedStart).getTimezoneOffset(), new NativeDate(changedEnd).getTimezoneOffset()],
        changedBounds: [changedStart, changedEnd],
      }));
    `;
    const result = spawnSync(process.execPath, ["-e", script], {
      env: { ...process.env, TZ: "America/New_York" },
      stdio: "pipe",
    });
    expect(result.status, result.stderr.toString()).toBe(0);
    expect(JSON.parse(result.stdout.toString())).toEqual({
      updates: 3,
      cleared: 7,
      initialOffsets: [300, 240],
      changedOffsets: [-330, -330],
      changedBounds: [Date.parse("2026-04-14T18:30:00.000Z"), Date.parse("2026-04-15T18:30:00.000Z")],
    });
  });
});
