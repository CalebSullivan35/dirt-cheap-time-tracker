/** Duration helpers shared by web and mobile. All durations are in milliseconds. */

export function entryDurationMs(
  entry: { startedAt: Date | string; endedAt: Date | string | null },
  now: Date = new Date(),
): number {
  const start = new Date(entry.startedAt).getTime();
  const end = entry.endedAt ? new Date(entry.endedAt).getTime() : now.getTime();
  return Math.max(0, end - start);
}

/** 3725000 -> "1:02:05" */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(Math.max(0, ms) / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** 5400000 -> "1h 30m", 300000 -> "5m" */
export function formatDurationShort(ms: number): string {
  const totalMinutes = Math.floor(Math.max(0, ms) / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** Local-date key (YYYY-MM-DD) used to group entries by day. */
export function dayKey(date: Date | string): string {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export interface DayGroup<T> {
  day: string;
  totalMs: number;
  entries: T[];
}

/** Groups entries (assumed sorted newest first) by local day, with per-day totals. */
export function groupEntriesByDay<
  T extends { startedAt: Date | string; endedAt: Date | string | null },
>(entries: T[], now: Date = new Date()): DayGroup<T>[] {
  const groups = new Map<string, DayGroup<T>>();
  for (const entry of entries) {
    const key = dayKey(entry.startedAt);
    let group = groups.get(key);
    if (!group) {
      group = { day: key, totalMs: 0, entries: [] };
      groups.set(key, group);
    }
    group.entries.push(entry);
    group.totalMs += entryDurationMs(entry, now);
  }
  return [...groups.values()];
}

/**
 * Parses loose duration text typed by a user: "1:30", "1h 30m", "90m", "1.5h", "45".
 * A bare number is minutes. Returns milliseconds, or null if unparseable.
 */
export function parseDurationInput(text: string): number | null {
  const t = text.trim().toLowerCase();
  if (!t) return null;
  const colon = /^(\d+):([0-5]?\d)(?::([0-5]?\d))?$/.exec(t);
  if (colon) {
    const [, h, m, s] = colon;
    return ((Number(h) * 60 + Number(m)) * 60 + Number(s ?? 0)) * 1000;
  }
  const units = /^(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?$/.exec(t);
  if (units && (units[1] || units[2])) {
    return Math.round((Number(units[1] ?? 0) * 60 + Number(units[2] ?? 0)) * 60000);
  }
  if (/^\d+(?:\.\d+)?$/.test(t)) return Math.round(Number(t) * 60000);
  return null;
}
