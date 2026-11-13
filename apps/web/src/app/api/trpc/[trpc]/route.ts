import { auth } from "@clerk/nextjs/server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@dct/api";
import { getDb } from "@dct/db";

// Serves both the web app (cookie session) and the Expo app (Bearer session token).
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: async () => {
      const { userId, orgId } = await auth();
      return { db: getDb(), auth: userId ? { userId, orgId: orgId ?? null } : null };
    },
    onError:
      process.env.NODE_ENV === "development"
        ? ({ path, error }) => console.error(`tRPC failed on ${path ?? "<no-path>"}:`, error)
        : undefined,
  });

export { handler as GET, handler as POST };
