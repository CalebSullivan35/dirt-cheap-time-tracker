import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Db } from "@dct/db";

export interface AuthInfo {
  userId: string;
  /** Active Clerk organization, or null when working in the personal workspace. */
  orgId: string | null;
}

export interface Context {
  db: Db;
  auth: AuthInfo | null;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError: error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const publicProcedure = t.procedure;

/** Requires a signed-in user and resolves the workspace everything is scoped to. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.auth) throw new TRPCError({ code: "UNAUTHORIZED" });
  const { userId, orgId } = ctx.auth;
  return next({ ctx: { db: ctx.db, userId, workspaceId: orgId ?? userId } });
});
