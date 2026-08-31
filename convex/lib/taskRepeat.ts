/** Landed `taskRepeatCfgs` cycle names — not the #170 `{frequency,interval}` shape. */
export type RepeatCycle = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";

export type RepeatCfgInput = {
  repeatCycle: RepeatCycle;
  /** Every N cycles. Must be an integer >= 1. */
  repeatEvery: number;
  /** 0–6 Sunday-first. Empty WEEKLY list means “same weekday as `fromMs`”. */
  weekdays: readonly number[];
  monthlyLastDay?: boolean;
  /** When true, keep advancing until the next due is >= `nowMs`. */
  skipOverdue: boolean;
};

export const DAY_MS = 24 * 60 * 60 * 1000;

export function assertRepeatEvery(repeatEvery: number): number {
  if (!Number.isInteger(repeatEvery) || repeatEvery < 1) {
    throw new Error("repeatEvery interval must be an integer >= 1");
  }
  return repeatEvery;
}

function utcParts(ms: number): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  ms: number;
  weekday: number;
} {
  const d = new Date(ms);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    ms: d.getUTCMilliseconds(),
    weekday: d.getUTCDay(),
  };
}

function utcFromParts(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  ms: number,
): number {
  return Date.UTC(year, month, day, hour, minute, second, ms);
}

function lastUtcDayOfMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
}

function addUtcDays(fromMs: number, days: number): number {
  return fromMs + days * DAY_MS;
}

function addUtcMonths(fromMs: number, months: number, monthlyLastDay: boolean): number {
  const p = utcParts(fromMs);
  const rawMonth = p.month + months;
  const year = p.year + Math.floor(rawMonth / 12);
  const month = ((rawMonth % 12) + 12) % 12;
  const lastDay = lastUtcDayOfMonth(year, month);
  const day = monthlyLastDay ? lastDay : Math.min(p.day, lastDay);
  return utcFromParts(year, month, day, p.hour, p.minute, p.second, p.ms);
}

function nextWeeklyDueAt(fromMs: number, repeatEvery: number, weekdays: readonly number[]): number {
  const fromWeekday = utcParts(fromMs).weekday;
  const allowed =
    weekdays.length > 0
      ? [...new Set(weekdays.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6))]
      : [fromWeekday];

  if (allowed.length === 0) {
    return addUtcDays(fromMs, 7 * repeatEvery);
  }

  if (allowed.length === 1 && allowed[0] === fromWeekday) {
    return addUtcDays(fromMs, 7 * repeatEvery);
  }

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addUtcDays(fromMs, offset);
    if (allowed.includes(utcParts(candidate).weekday)) {
      if (utcParts(candidate).weekday === fromWeekday) {
        return addUtcDays(fromMs, 7 * repeatEvery);
      }
      return candidate;
    }
  }

  return addUtcDays(fromMs, 7 * repeatEvery);
}

function stepOnce(fromMs: number, cfg: RepeatCfgInput): number {
  const every = assertRepeatEvery(cfg.repeatEvery);
  switch (cfg.repeatCycle) {
    case "DAILY":
      return addUtcDays(fromMs, every);
    case "WEEKLY":
      return nextWeeklyDueAt(fromMs, every, cfg.weekdays);
    case "MONTHLY":
      return addUtcMonths(fromMs, every, cfg.monthlyLastDay === true);
    case "YEARLY":
      return addUtcMonths(fromMs, 12 * every, cfg.monthlyLastDay === true);
    default: {
      const _exhaustive: never = cfg.repeatCycle;
      return _exhaustive;
    }
  }
}

/**
 * Next due after `fromMs`. When `skipOverdue` is set, keep stepping until
 * the result is >= `nowMs` so missed days do not pile up.
 */
export function computeNextRepeatDueAt(
  fromMs: number,
  cfg: RepeatCfgInput,
  nowMs: number,
): number {
  assertRepeatEvery(cfg.repeatEvery);
  let next = stepOnce(fromMs, cfg);
  if (!cfg.skipOverdue) {
    return next;
  }
  let guard = 0;
  while (next < nowMs && guard < 400) {
    next = stepOnce(next, cfg);
    guard += 1;
  }
  return next;
}

export function repeatDraftToCfg(
  draft: "daily" | "weekly",
  weekdayFromMs: number,
): RepeatCfgInput {
  if (draft === "daily") {
    return {
      repeatCycle: "DAILY",
      repeatEvery: 1,
      weekdays: [],
      skipOverdue: true,
    };
  }
  return {
    repeatCycle: "WEEKLY",
    repeatEvery: 1,
    weekdays: [utcParts(weekdayFromMs).weekday],
    skipOverdue: true,
  };
}
