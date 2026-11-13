"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { entryDurationMs, formatDuration } from "@dct/validators";
import { useTRPC } from "@/trpc/react";
import { ProjectSelect } from "./project-select";
import { useNow } from "./use-now";

export function TimerBar() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const current = useQuery(trpc.timer.current.queryOptions());
  const projects = useQuery(trpc.project.list.queryOptions());
  const running = current.data ?? null;
  const now = useNow(!!running);

  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.timer.current.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() }),
    ]);

  const start = useMutation(
    trpc.timer.start.mutationOptions({
      onSuccess: async () => {
        setDescription("");
        setProjectId(null);
        await invalidate();
      },
    }),
  );
  const stop = useMutation(trpc.timer.stop.mutationOptions({ onSuccess: invalidate }));
  const update = useMutation(trpc.timer.update.mutationOptions({ onSuccess: invalidate }));

  const error = start.error ?? stop.error ?? update.error;

  if (running) {
    return (
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex flex-wrap items-center gap-2">
          <input
            key={running.id}
            className="input min-w-0 flex-1"
            defaultValue={running.description}
            placeholder="What are you working on?"
            onBlur={(e) => {
              if (e.target.value !== running.description)
                update.mutate({ description: e.target.value });
            }}
          />
          <ProjectSelect
            projects={projects.data ?? []}
            value={running.projectId}
            onChange={(id) => update.mutate({ projectId: id })}
          />
          <span className="w-24 text-right font-mono text-lg tabular-nums" aria-live="off">
            {formatDuration(entryDurationMs(running, now))}
          </span>
          <button
            className="btn bg-danger text-white"
            disabled={stop.isPending}
            onClick={() => stop.mutate()}
          >
            Stop
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-danger">{error.message}</p>}
      </div>
    );
  }

  return (
    <form
      className="rounded-lg border border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        start.mutate({ description, projectId });
      }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="input min-w-0 flex-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
        />
        <ProjectSelect projects={projects.data ?? []} value={projectId} onChange={setProjectId} />
        <span className="w-24 text-right font-mono text-lg tabular-nums text-muted">0:00:00</span>
        <button className="btn-primary" disabled={start.isPending || current.isLoading}>
          Start
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error.message}</p>}
    </form>
  );
}
