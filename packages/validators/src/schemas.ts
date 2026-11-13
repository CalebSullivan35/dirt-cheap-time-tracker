import { z } from "zod";

export const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const PROJECT_COLORS = [
  "#6366f1", // indigo
  "#0ea5e9", // sky
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#64748b", // slate
] as const;

const id = z.uuid();
const description = z.string().trim().max(500);

export const createProjectInput = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  color: z.string().regex(HEX_COLOR).default(PROJECT_COLORS[0]),
});

export const updateProjectInput = z.object({
  id,
  name: z.string().trim().min(1).max(100).optional(),
  color: z.string().regex(HEX_COLOR).optional(),
  archived: z.boolean().optional(),
});

export const listProjectsInput = z
  .object({ includeArchived: z.boolean().default(false) })
  .default({ includeArchived: false });

export const startTimerInput = z.object({
  description: description.default(""),
  projectId: id.nullish(),
});

export const updateRunningTimerInput = z.object({
  description: description.optional(),
  projectId: id.nullish(),
  startedAt: z.coerce.date().optional(),
});

export const createEntryInput = z
  .object({
    description: description.default(""),
    projectId: id.nullish(),
    startedAt: z.coerce.date(),
    endedAt: z.coerce.date(),
  })
  .refine((v) => v.endedAt > v.startedAt, {
    message: "End time must be after start time",
    path: ["endedAt"],
  });

export const updateEntryInput = z
  .object({
    id,
    description: description.optional(),
    projectId: id.nullish(),
    startedAt: z.coerce.date().optional(),
    endedAt: z.coerce.date().optional(),
  })
  .refine((v) => !v.startedAt || !v.endedAt || v.endedAt > v.startedAt, {
    message: "End time must be after start time",
    path: ["endedAt"],
  });

export const deleteEntryInput = z.object({ id });

export const listEntriesInput = z
  .object({
    from: z.coerce.date().optional(),
    to: z.coerce.date().optional(),
    limit: z.number().int().min(1).max(500).default(200),
  })
  .default({ limit: 200 });

export type CreateProjectInput = z.input<typeof createProjectInput>;
export type UpdateProjectInput = z.input<typeof updateProjectInput>;
export type StartTimerInput = z.input<typeof startTimerInput>;
export type CreateEntryInput = z.input<typeof createEntryInput>;
export type UpdateEntryInput = z.input<typeof updateEntryInput>;
