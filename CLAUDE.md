# DirtCheapTimeTracker

pnpm + Turborepo monorepo. See README.md for the layout and setup.

- Keep running costs near zero; check before adding paid services.
- Auth is Clerk (Core 3: `<Show>`, `signIn.password()` / `finalize()`, no `SignedIn`/`setActive`). Teams are Clerk Organizations. The DB stores only Clerk ids.
- All data is scoped by `workspaceId` (= Clerk `orgId ?? userId`), resolved in `packages/api/src/trpc.ts`.
- Next.js 16 has `cacheComponents` on: anything reading the clock or auth must render inside `<Suspense>`. Read `apps/web/node_modules/next/dist/docs/` before using unfamiliar Next APIs.
- Expo: add packages with `npx expo install` so versions match the SDK. The mobile app must keep working in Expo Go, so no custom native modules.
- Shared input validation goes in `packages/validators`; both apps and the API import it.
- Test: `pnpm typecheck`, `pnpm test` (with `TEST_DATABASE_URL` set to a migrated Postgres to run the API tests).
