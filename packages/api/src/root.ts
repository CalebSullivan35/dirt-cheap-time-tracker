import { entryRouter } from "./routers/entry";
import { projectRouter } from "./routers/project";
import { timerRouter } from "./routers/timer";
import { createCallerFactory, router } from "./trpc";

export const appRouter = router({
  project: projectRouter,
  timer: timerRouter,
  entry: entryRouter,
});

export type AppRouter = typeof appRouter;
export const createCaller = createCallerFactory(appRouter);
