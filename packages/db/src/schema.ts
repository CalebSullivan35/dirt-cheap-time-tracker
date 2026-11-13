import { sql } from "drizzle-orm";
import { check, index, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

/**
 * Auth lives in Clerk. We only store Clerk ids:
 * - `userId`: Clerk user id (user_...)
 * - `workspaceId`: the Clerk organization id (org_...) when the user is acting
 *   inside an organization, otherwise their own user id (a personal workspace).
 * Everything a team shares is scoped by `workspaceId`.
 */

const timestamps = {
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: text().notNull(),
    name: text().notNull(),
    color: text().notNull(),
    createdBy: text().notNull(),
    archivedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [index().on(t.workspaceId)],
);

export const timeEntries = pgTable(
  "time_entries",
  {
    id: uuid().primaryKey().defaultRandom(),
    workspaceId: text().notNull(),
    userId: text().notNull(),
    projectId: uuid().references(() => projects.id, { onDelete: "set null" }),
    description: text().notNull().default(""),
    startedAt: timestamp({ withTimezone: true }).notNull(),
    /** null while the timer is running */
    endedAt: timestamp({ withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    index().on(t.workspaceId, t.userId, t.startedAt),
    index().on(t.projectId),
    // A user can have at most one running timer.
    uniqueIndex("time_entries_one_running_per_user")
      .on(t.userId)
      .where(sql`${t.endedAt} is null`),
    check("time_entries_end_after_start", sql`${t.endedAt} is null or ${t.endedAt} > ${t.startedAt}`),
  ],
);

export type Project = typeof projects.$inferSelect;
export type TimeEntry = typeof timeEntries.$inferSelect;
