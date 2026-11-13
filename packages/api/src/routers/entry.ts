import { TRPCError } from "@trpc/server";
import { and, desc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { timeEntries } from "@dct/db";
import {
  createEntryInput,
  deleteEntryInput,
  listEntriesInput,
  updateEntryInput,
} from "@dct/validators";
import { protectedProcedure, router } from "../trpc";
import { assertProjectUsable } from "./shared";

const own = (id: string, userId: string, workspaceId: string) =>
  and(
    eq(timeEntries.id, id),
    eq(timeEntries.userId, userId),
    eq(timeEntries.workspaceId, workspaceId),
  );

export const entryRouter = router({
  /** The signed-in user's finished entries in this workspace, newest first. */
  list: protectedProcedure.input(listEntriesInput).query(({ ctx, input }) =>
    ctx.db
      .select()
      .from(timeEntries)
      .where(
        and(
          eq(timeEntries.workspaceId, ctx.workspaceId),
          eq(timeEntries.userId, ctx.userId),
          isNotNull(timeEntries.endedAt),
          input.from ? gte(timeEntries.startedAt, input.from) : undefined,
          input.to ? lt(timeEntries.startedAt, input.to) : undefined,
        ),
      )
      .orderBy(desc(timeEntries.startedAt))
      .limit(input.limit),
  ),

  /** Manually log a finished block of time. */
  create: protectedProcedure.input(createEntryInput).mutation(async ({ ctx, input }) => {
    await assertProjectUsable(ctx.db, ctx.workspaceId, input.projectId);
    const [entry] = await ctx.db
      .insert(timeEntries)
      .values({
        workspaceId: ctx.workspaceId,
        userId: ctx.userId,
        projectId: input.projectId ?? null,
        description: input.description,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
      })
      .returning();
    return entry!;
  }),

  update: protectedProcedure.input(updateEntryInput).mutation(async ({ ctx, input }) => {
    const { id, ...changes } = input;
    await assertProjectUsable(ctx.db, ctx.workspaceId, changes.projectId);
    const [existing] = await ctx.db
      .select()
      .from(timeEntries)
      .where(own(id, ctx.userId, ctx.workspaceId));
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
    const startedAt = changes.startedAt ?? existing.startedAt;
    const endedAt = changes.endedAt ?? existing.endedAt;
    if (endedAt && endedAt <= startedAt) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "End time must be after start time" });
    }
    const [entry] = await ctx.db
      .update(timeEntries)
      .set(changes)
      .where(own(id, ctx.userId, ctx.workspaceId))
      .returning();
    return entry!;
  }),

  delete: protectedProcedure.input(deleteEntryInput).mutation(async ({ ctx, input }) => {
    const [entry] = await ctx.db
      .delete(timeEntries)
      .where(own(input.id, ctx.userId, ctx.workspaceId))
      .returning({ id: timeEntries.id });
    if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "Entry not found" });
    return entry;
  }),
});
