import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { projects, type Db } from "@dct/db";

/** Ensures a project id (if given) belongs to the workspace and is not archived. */
export async function assertProjectUsable(
  db: Db,
  workspaceId: string,
  projectId: string | null | undefined,
) {
  if (!projectId) return;
  const [project] = await db
    .select({ id: projects.id })
    .from(projects)
    .where(
      and(
        eq(projects.id, projectId),
        eq(projects.workspaceId, workspaceId),
        isNull(projects.archivedAt),
      ),
    );
  if (!project) throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown project" });
}
