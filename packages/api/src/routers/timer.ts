import { TRPCError } from "@trpc/server";
import { and, eq, isNull, sql } from "drizzle-orm";
import { timeEntries } from "@dct/db";
import { startTimerInput, updateRunningTimerInput } from "@dct/validators";
import { protectedProcedure, router } from "../trpc";
import { assertProjectUsable } from "./shared";

const running = (userId: string) =>
  and(eq(timeEntries.userId, userId), isNull(timeEntries.endedAt));

export const timerRouter = router({
  /** The signed-in user's running timer, or null. */
  current: protectedProcedure.query(async ({ ctx }) => {
    const [entry] = await ctx.db.select().from(timeEntries).where(running(ctx.userId));
    return entry ?? null;
  }),

  /** Starts a timer. Any timer already running is stopped first, like Clockify/Toggl. */
  start: protectedProcedure.input(startTimerInput).mutation(async ({ ctx, input }) => {
    await assertProjectUsable(ctx.db, ctx.workspaceId, input.projectId);
    return ctx.db.transaction(async (tx) => {
      const now = new Date();
      await tx
        .update(timeEntries)
        // greatest() keeps end > start even if the old timer began this same millisecond.
        .set({
          endedAt: sql`greatest(${now.toISOString()}::timestamptz, ${timeEntries.startedAt} + interval '1 millisecond')`,
        })
        .where(running(ctx.userId));
      const [entry] = await tx
        .insert(timeEntries)
        .values({
          workspaceId: ctx.workspaceId,
          userId: ctx.userId,
          projectId: input.projectId ?? null,
          description: input.description,
          startedAt: now,
        })
        .returning();
      return entry!;
    });
  }),

  /** Edit the running timer's description, project or start time without stopping it. */
  update: protectedProcedure.input(updateRunningTimerInput).mutation(async ({ ctx, input }) => {
    await assertProjectUsable(ctx.db, ctx.workspaceId, input.projectId);
    if (input.startedAt && input.startedAt > new Date()) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Start time can't be in the future" });
    }
    const [entry] = await ctx.db
      .update(timeEntries)
      .set(input)
      .where(and(running(ctx.userId), eq(timeEntries.workspaceId, ctx.workspaceId)))
      .returning();
    if (!entry) throw new TRPCError({ code: "NOT_FOUND", message: "No timer is running" });
    return entry;
  }),

  stop: protectedProcedure.mutation(async ({ ctx }) => {
    const [existing] = await ctx.db.select().from(timeEntries).where(running(ctx.userId));
    if (!existing) throw new TRPCError({ code: "NOT_FOUND", message: "No timer is running" });
    // Guard the end-after-start constraint for timers stopped within the same millisecond.
    const endedAt = new Date(Math.max(Date.now(), existing.startedAt.getTime() + 1));
    const [entry] = await ctx.db
      .update(timeEntries)
      .set({ endedAt })
      .where(eq(timeEntries.id, existing.id))
      .returning();
    return entry!;
  }),
});
