import { TRPCError } from "@trpc/server";
import { and, asc, eq, isNull } from "drizzle-orm";
import { projects } from "@dct/db";
import { createProjectInput, listProjectsInput, updateProjectInput } from "@dct/validators";
import { protectedProcedure, router } from "../trpc";

export const projectRouter = router({
  list: protectedProcedure.input(listProjectsInput).query(({ ctx, input }) =>
    ctx.db
      .select()
      .from(projects)
      .where(
        and(
          eq(projects.workspaceId, ctx.workspaceId),
          input.includeArchived ? undefined : isNull(projects.archivedAt),
        ),
      )
      .orderBy(asc(projects.name)),
  ),

  create: protectedProcedure.input(createProjectInput).mutation(async ({ ctx, input }) => {
    const [project] = await ctx.db
      .insert(projects)
      .values({ ...input, workspaceId: ctx.workspaceId, createdBy: ctx.userId })
      .returning();
    return project!;
  }),

  update: protectedProcedure.input(updateProjectInput).mutation(async ({ ctx, input }) => {
    const { id, archived, ...rest } = input;
    const [project] = await ctx.db
      .update(projects)
      .set({
        ...rest,
        ...(archived === undefined ? {} : { archivedAt: archived ? new Date() : null }),
      })
      .where(and(eq(projects.id, id), eq(projects.workspaceId, ctx.workspaceId)))
      .returning();
    if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });
    return project;
  }),
});
