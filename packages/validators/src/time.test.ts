import { describe, expect, it } from "vitest";
import {
  formatDuration,
  formatDurationShort,
  groupEntriesByDay,
  parseDurationInput,
} from "./time";
import { createEntryInput } from "./schemas";

describe("formatDuration", () => {
  it("formats h:mm:ss", () => {
    expect(formatDuration(3_725_000)).toBe("1:02:05");
    expect(formatDuration(0)).toBe("0:00:00");
    expect(formatDuration(-5)).toBe("0:00:00");
  });
  it("formats short", () => {
    expect(formatDurationShort(5_400_000)).toBe("1h 30m");
    expect(formatDurationShort(3_600_000)).toBe("1h");
    expect(formatDurationShort(300_000)).toBe("5m");
  });
});

describe("parseDurationInput", () => {
  it.each([
    ["1:30", 90],
    ["1h 30m", 90],
    ["1h", 60],
    ["90m", 90],
    ["1.5h", 90],
    ["45", 45],
  ])("%s -> %i minutes", (input, minutes) => {
    expect(parseDurationInput(input)).toBe(minutes * 60_000);
  });
  it("rejects junk", () => {
    expect(parseDurationInput("abc")).toBeNull();
    expect(parseDurationInput("")).toBeNull();
  });
});

describe("groupEntriesByDay", () => {
  it("groups and totals, counting running entries up to now", () => {
    const now = new Date(2026, 0, 2, 12, 0);
    const groups = groupEntriesByDay(
      [
        { startedAt: new Date(2026, 0, 2, 11, 0), endedAt: null },
        { startedAt: new Date(2026, 0, 2, 9, 0), endedAt: new Date(2026, 0, 2, 10, 0) },
        { startedAt: new Date(2026, 0, 1, 9, 0), endedAt: new Date(2026, 0, 1, 9, 30) },
      ],
      now,
    );
    expect(groups.map((g) => [g.day, g.totalMs / 60_000])).toEqual([
      ["2026-01-02", 120],
      ["2026-01-01", 30],
    ]);
  });
});

describe("createEntryInput", () => {
  it("rejects end before start", () => {
    const r = createEntryInput.safeParse({
      startedAt: "2026-01-01T10:00:00Z",
      endedAt: "2026-01-01T09:00:00Z",
    });
    expect(r.success).toBe(false);
  });
});
