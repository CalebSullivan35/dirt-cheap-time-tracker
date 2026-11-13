const pad = (n: number) => String(n).padStart(2, "0");

/** Date -> "YYYY-MM-DD" in local time (for <input type="date">). */
export const toDateInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Date -> "HH:MM" in local time (for <input type="time">). */
export const toTimeInput = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

/** Combines local date and time input values into a Date. */
export function fromInputs(date: string, time: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return new Date(y!, m! - 1, d!, hh!, mm!);
}

export const formatClock = (d: Date | string) =>
  new Date(d).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

export function formatDayHeading(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y!, m! - 1, d!);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (toDateInput(date) === toDateInput(today)) return "Today";
  if (toDateInput(date) === toDateInput(yesterday)) return "Yesterday";
  return date.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}
