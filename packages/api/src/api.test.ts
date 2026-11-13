/**
 * Integration tests against a real Postgres.
 * Set TEST_DATABASE_URL (migrations must be applied); skipped otherwise.
 */
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { createDb, projects, timeEntries } from "@dct/db";
import { createCaller } from "./root";

const url = process.env.TEST_DATABASE_URL;
const suite = url ? describe : describe.skip;

suite("api", () => {
  const db = createDb(url ?? "postgres://unused");
  const alice = createCaller({ db, auth: { userId: "user_alice", orgId: null } });
  const aliceInTeam = createCaller({ db, auth: { userId: "user_alice", orgId: "org_team" } });
  const bobInTeam = createCaller({ db, auth: { userId: "user_bob", orgId: "org_team" } });
  const anon = createCaller({ db, auth: null });

  beforeEach(async () => {
    await db.delete(timeEntries);
    await db.delete(projects);
  });
  afterAll(async () => {
    await db.$client.end();
  });

  it("rejects anonymous callers", async () => {
    await expect(anon.project.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("scopes projects to the workspace", async () => {
    await alice.project.create({ name: "Personal" });
    await aliceInTeam.project.create({ name: "Team site", color: "#10b981" });
    expect((await alice.project.list()).map((p) => p.name)).toEqual(["Personal"]);
    expect((await bobInTeam.project.list()).map((p) => p.name)).toEqual(["Team site"]);
  });

  it("archives projects and hides them by default", async () => {
    const p = await alice.project.create({ name: "Old" });
    await alice.project.update({ id: p.id, archived: true });
    expect(await alice.project.list()).toHaveLength(0);
    expect(await alice.project.list({ includeArchived: true })).toHaveLength(1);
    await expect(alice.timer.start({ projectId: p.id })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
  });

  it("starts, switches and stops a timer", async () => {
    const p = await alice.project.create({ name: "Client A" });
    expect(await alice.timer.current()).toBeNull();

    const first = await alice.timer.start({ description: "Design", projectId: p.id });
    expect((await alice.timer.current())?.id).toBe(first.id);

    // Starting again immediately stops the first timer.
    const second = await alice.timer.start({ description: "Build" });
    expect((await alice.timer.current())?.id).toBe(second.id);
    const finished = await alice.entry.list();
    expect(finished.map((e) => e.id)).toEqual([first.id]);
    expect(finished[0]!.endedAt!.getTime()).toBeGreaterThan(finished[0]!.startedAt.getTime());

    await alice.timer.update({ description: "Build API" });
    const stopped = await alice.timer.stop();
    expect(stopped.description).toBe("Build API");
    expect(await alice.timer.current()).toBeNull();
    await expect(alice.timer.stop()).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("creates, edits and deletes manual entries", async () => {
    const e = await alice.entry.create({
      description: "Meeting",
      startedAt: new Date("2026-01-01T09:00:00Z"),
      endedAt: new Date("2026-01-01T10:00:00Z"),
    });
    await expect(
      alice.entry.update({ id: e.id, endedAt: new Date("2026-01-01T08:00:00Z") }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    const updated = await alice.entry.update({ id: e.id, description: "Standup" });
    expect(updated.description).toBe("Standup");

    const range = await alice.entry.list({
      from: new Date("2026-01-01T00:00:00Z"),
      to: new Date("2026-01-02T00:00:00Z"),
    });
    expect(range).toHaveLength(1);

    await alice.entry.delete({ id: e.id });
    expect(await alice.entry.list()).toHaveLength(0);
  });

  it("does not let users touch each other's entries", async () => {
    const e = await aliceInTeam.entry.create({
      startedAt: new Date("2026-01-01T09:00:00Z"),
      endedAt: new Date("2026-01-01T10:00:00Z"),
    });
    expect(await bobInTeam.entry.list()).toHaveLength(0);
    await expect(bobInTeam.entry.delete({ id: e.id })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
