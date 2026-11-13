# DirtCheapTimeTracker

A Timely/Clockify-style time tracker for solo work and teams, with a Next.js web app and an Expo iOS app built from one TypeScript monorepo.

## Stack

| Piece | Choice | Cost |
| --- | --- | --- |
| Web app + API | Next.js 16 (App Router), tRPC | Vercel Hobby is free for non-commercial use, Pro is $20/mo |
| iOS app | Expo SDK 58 + Expo Router, tested in Expo Go | Free (Apple dev account $99/yr to ship) |
| Auth + teams | Clerk, with Organizations as teams | Free up to 50k monthly users; free orgs max 20 members |
| Database | Postgres via Drizzle ORM (Neon free tier in prod) | Free |

## Layout

```
apps/
  web/          Next.js app. Also hosts the API at /api/trpc for web and mobile.
  mobile/       Expo app (iOS first). Calls the web app's API with a Clerk token.
packages/
  api/          tRPC routers: project, timer, entry. Shared by both apps (types only on mobile).
  db/           Drizzle schema, migrations, and the Postgres client.
  validators/   zod input schemas and duration/formatting helpers used everywhere.
```

### Data model

Clerk owns users and organizations; we only store their ids.

- **workspace**: the active Clerk organization id, or the user's own id when they are in their personal workspace. Projects and entries are scoped to it, so switching org in the UI switches which projects you see.
- **projects**: `name`, `color`, `archived_at`, per workspace.
- **time_entries**: `user_id`, optional `project_id`, `description`, `started_at`, `ended_at`. A running timer has `ended_at = null`, and a unique index makes sure each user has at most one running timer.

## Setup

Requirements: Node 20.9+ and pnpm 10.

```bash
pnpm install
```

### 1. Database

Use any Postgres. For a free hosted one, create a project on [Neon](https://neon.tech) and copy the **pooled** connection string. Or run Postgres locally.

### 2. Clerk

1. Create an application at [dashboard.clerk.com](https://dashboard.clerk.com). Enable **Email** + **Password** sign-in.
2. Under **Organizations**, turn organizations on. Personal accounts can stay enabled, so people can track time without a team.
3. Copy the publishable key and secret key from **API keys**.

### 3. Env files

```bash
cp apps/web/.env.example apps/web/.env.local       # DATABASE_URL + Clerk keys
cp apps/mobile/.env.example apps/mobile/.env       # EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
pnpm db:migrate                                     # creates the tables
```

### 4. Run the web app

```bash
pnpm dev:web          # http://localhost:3000
```

### 5. Run the iOS app in Expo Go

1. Install **Expo Go** from the App Store on your iPhone. It must support SDK 58.
2. Keep `pnpm dev:web` running. The mobile app uses it as its API.
3. In another terminal: `pnpm dev:mobile`, then scan the QR code with the iPhone camera.
4. The phone and computer must be on the same Wi-Fi. The app calls `http://<your computer's IP>:3000`, taken from the Metro dev server address. If that doesn't work (for example on a VPN or a guest network), set `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` and restart with `pnpm dev:mobile --clear`.

Sign up in the app with an email and password. Clerk emails you a verification code. On a Clerk development instance, emails like `you+clerk_test@example.com` accept the code `424242`.

## Scripts

| Command | What it does |
| --- | --- |
| `pnpm dev:web` / `pnpm dev:mobile` | Run one app |
| `pnpm typecheck` | Type-check every package |
| `pnpm test` | Unit tests; the API integration tests also run when `TEST_DATABASE_URL` is set |
| `pnpm db:generate` | Create a migration after changing `packages/db/src/schema.ts` |
| `pnpm db:migrate` | Apply migrations to `DATABASE_URL` |

## Deploying (later)

- **Web/API**: import the repo in Vercel, set the root directory to `apps/web`, and add the same env vars. Use your Neon pooled URL.
- **iOS**: set `EXPO_PUBLIC_API_URL` to the deployed URL, then `eas build -p ios` and `eas submit` (EAS free tier).
