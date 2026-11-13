"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { formatDurationShort } from "@dct/validators";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const duration = formatDurationShort(endedAt.getTime() - startedAt.getTime());

  const create = useMutation(
    trpc.entry.create.mutationOptions({
      onSuccess: async () => {
        toast.success(`Added ${duration}`);
        setDescription("");
        await queryClient.invalidateQueries({ queryKey: trpc.entry.list.queryKey() });
        onDone?.();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  return (
    <Card className="gap-4 p-4">
      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ description, projectId, startedAt, endedAt });
        }}
      >
        <div className="flex flex-wrap gap-2">
          <Input
            className="min-w-0 flex-1"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            autoFocus
          />
          <ProjectSelect projects={projects.data ?? []} value={projectId} onChange={setProjectId} />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="entry-date">Date</Label>
            <Input id="entry-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="entry-start">From</Label>
            <Input
              id="entry-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="entry-end">To</Label>
            <Input id="entry-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
          </div>
          <span className="text-muted-foreground pb-2 text-sm tabular-nums">{duration}</span>
          <Button className="ml-auto" disabled={create.isPending}>
            Add entry
          </Button>
        </div>
      </form>
    </Card>
  );
}
