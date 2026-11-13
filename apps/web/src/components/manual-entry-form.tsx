"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { formatDurationShort } from "@dct/validators";
import { useTRPC } from "@/trpc/react";
import { fromInputs, toDateInput, toTimeInput } from "./datetime";
import { ProjectSelect } from "./project-select";

export function ManualEntryForm({ onDone }: { onDone?: () => void }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const projects = useQuery(trpc.project.list.queryOptions());

  const [initial] = useState(() => {
    const end = new Date();
    const start = new Date(end.getTime() - 60 * 60 * 1000);
    return { date: toDateInput(end), start: toTimeInput(start), end: toTimeInput(end) };
  });
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [date, setDate] = useState(initial.date);
  const [startTime, setStartTime] = useState(initial.start);
  const [endTime, setEndTime] = useState(initial.end);

  const startedAt = fromInputs(date, startTime);
  let endedAt = fromInputs(date, endTime);
  // An end time before the start time means the entry ran past midnight.
  if (endedAt <= startedAt) endedAt = new Date(endedAt.getTime() + 24 * 60 * 60 * 1000);

  const create = useMutation(
    trpc.entry.create.mutationOptions({
      onSuccess: async () => {
        setDescription("");
        await queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() });
        onDone?.();
      },
    }),
  );

  return (
    <form
      className="flex flex-col gap-2 rounded-lg border border-border bg-surface p-3"
      onSubmit={(e) => {
        e.preventDefault();
        create.mutate({ description, projectId, startedAt, endedAt });
      }}
    >
      <div className="flex flex-wrap gap-2">
        <input
          className="input min-w-0 flex-1"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
        />
        <ProjectSelect projects={projects.data ?? []} value={projectId} onChange={setProjectId} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          aria-label="Date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <input
          type="time"
          aria-label="Start time"
          className="input"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <span className="text-muted">to</span>
        <input
          type="time"
          aria-label="End time"
          className="input"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <span className="text-sm text-muted">
          {formatDurationShort(endedAt.getTime() - startedAt.getTime())}
        </span>
        <button className="btn-primary ml-auto" disabled={create.isPending}>
          Add entry
        </button>
      </div>
      {create.error && <p className="text-sm text-danger">{create.error.message}</p>}
    </form>
  );
}
