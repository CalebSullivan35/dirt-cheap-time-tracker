"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { entryDurationMs, formatDurationShort, groupEntriesByDay } from "@dct/validators";
import { useTRPC } from "@/trpc/react";
import { formatClock, formatDayHeading } from "./datetime";

export function EntryList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const entries = useQuery(trpc.entry.list.queryOptions());
  const projects = useQuery(trpc.project.list.queryOptions({ includeArchived: true }));
  const projectById = new Map((projects.data ?? []).map((p) => [p.id, p]));

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.timer.current.queryKey() }),
    ]);
  const remove = useMutation(trpc.entry.delete.mutationOptions({ onSuccess: invalidate }));
  const restart = useMutation(trpc.timer.start.mutationOptions({ onSuccess: invalidate }));

  if (entries.isLoading) return <p className="text-sm text-muted">Loading entries…</p>;
  if (entries.error) return <p className="text-sm text-danger">{entries.error.message}</p>;
  if (!entries.data?.length)
    return (
      <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
        No time tracked yet. Start the timer or add an entry manually.
      </p>
    );

  return (
    <div className="flex flex-col gap-6">
      {groupEntriesByDay(entries.data).map((group) => (
        <section key={group.day}>
          <h2 className="mb-2 flex justify-between text-sm font-medium text-muted">
            <span>{formatDayHeading(group.day)}</span>
            <span className="tabular-nums">{formatDurationShort(group.totalMs)}</span>
          </h2>
          <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
            {group.entries.map((entry) => {
              const project = entry.projectId ? projectById.get(entry.projectId) : undefined;
              return (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-3 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">
                    {entry.description || <span className="text-muted">(no description)</span>}
                  </span>
                  {project && (
                    <span className="flex items-center gap-1.5 text-muted">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </span>
                  )}
                  <span className="text-muted tabular-nums">
                    {formatClock(entry.startedAt)} – {formatClock(entry.endedAt!)}
                  </span>
                  <span className="w-16 text-right font-medium tabular-nums">
                    {formatDurationShort(entryDurationMs(entry))}
                  </span>
                  <button
                    className="btn-ghost px-2 py-1"
                    title="Start a new timer with this description and project"
                    onClick={() =>
                      restart.mutate({
                        description: entry.description,
                        projectId: project && !project.archivedAt ? project.id : null,
                      })
                    }
                  >
                    ▶
                  </button>
                  <button
                    className="btn-ghost px-2 py-1 hover:text-danger"
                    title="Delete entry"
                    onClick={() => {
                      if (confirm("Delete this entry?")) remove.mutate({ id: entry.id });
                    }}
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
