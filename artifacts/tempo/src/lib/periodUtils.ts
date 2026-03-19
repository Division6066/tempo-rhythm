export type PeriodType = "daily" | "weekly" | "monthly" | "quarterly" | "yearly";

export function getCurrentPeriodDate(type: PeriodType): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (type) {
    case "daily":
      return formatDate(now);
    case "weekly": {
      const day = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      return formatDate(monday);
    }
    case "monthly":
      return `${y}-${pad(m + 1)}-01`;
    case "quarterly": {
      const q = Math.floor(m / 3);
      const qMonth = q * 3 + 1;
      return `${y}-${pad(qMonth)}-01`;
    }
    case "yearly":
      return `${y}-01-01`;
  }
}

export function prevPeriodDate(type: PeriodType, dateStr: string): string {
  const d = parseDate(dateStr);
  switch (type) {
    case "daily":
      d.setDate(d.getDate() - 1);
      break;
    case "weekly":
      d.setDate(d.getDate() - 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() - 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() - 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() - 1);
      break;
  }
  return formatDate(d);
}

export function nextPeriodDate(type: PeriodType, dateStr: string): string {
  const d = parseDate(dateStr);
  switch (type) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "quarterly":
      d.setMonth(d.getMonth() + 3);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return formatDate(d);
}

export function formatPeriodLabel(type: PeriodType, dateStr: string): string {
  const d = parseDate(dateStr);
  switch (type) {
    case "daily":
      return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    case "weekly": {
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;
    }
    case "monthly":
      return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    case "quarterly": {
      const q = Math.floor(d.getMonth() / 3) + 1;
      return `Q${q} ${d.getFullYear()}`;
    }
    case "yearly":
      return d.getFullYear().toString();
  }
}

export function getPeriodDateRange(type: PeriodType, dateStr: string): { start: string; end: string } {
  const d = parseDate(dateStr);
  switch (type) {
    case "daily":
      return { start: dateStr, end: dateStr };
    case "weekly": {
      const end = new Date(d);
      end.setDate(end.getDate() + 6);
      return { start: dateStr, end: formatDate(end) };
    }
    case "monthly": {
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);
      return { start: dateStr, end: formatDate(end) };
    }
    case "quarterly": {
      const end = new Date(d.getFullYear(), d.getMonth() + 3, 0);
      return { start: dateStr, end: formatDate(end) };
    }
    case "yearly": {
      return { start: `${d.getFullYear()}-01-01`, end: `${d.getFullYear()}-12-31` };
    }
  }
}

export function getTemplateContent(type: PeriodType, label: string): string {
  switch (type) {
    case "daily":
      return `# ${label}\n\n## Top 3 Priorities\n1. \n2. \n3. \n\n## Notes\n\n\n## How did it go?\n\n`;
    case "weekly":
      return `# ${label}\n\n## Goals\n- \n\n## Wins\n- \n\n## Notes\n\n\n## Next Week\n- \n`;
    case "monthly":
      return `# ${label}\n\n## Highlights\n- \n\n## Reflections\n\n\n## Goals for Next Month\n- \n`;
    case "quarterly":
      return `# ${label}\n\n## Key Results\n- \n\n## Wins\n- \n\n## Lessons Learned\n\n\n## Next Quarter Focus\n- \n`;
    case "yearly":
      return `# ${label}\n\n## Year in Review\n\n\n## Major Achievements\n- \n\n## Lessons Learned\n\n\n## Goals for Next Year\n- \n`;
  }
}

function parseDate(dateStr: string): Date {
  return new Date(dateStr + "T12:00:00");
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}
