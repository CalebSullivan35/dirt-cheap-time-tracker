"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Play, Square } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { entryDurationMs, formatDuration, formatDurationShort } from "@dct/validators";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  const onError = (e: { message: string }) => toast.error(e.message);

  const start = useMutation(
    trpc.timer.start.mutationOptions({
      onSuccess: async () => {
        setDescription("");
        setProjectId(null);
        await invalidate();
      },
      onError,
    }),
  );
  const stop = useMutation(
    trpc.timer.stop.mutationOptions({
      onSuccess: async (entry) => {
        toast.success(`Logged ${formatDurationShort(entryDurationMs(entry))}`, {
          description: entry.description || undefined,
        });
        await invalidate();
      },
      onError,
    }),
  );
  const update = useMutation(trpc.timer.update.mutationOptions({ onSuccess: invalidate, onError }));

  return (
    <Card
      className={cn(
        "gap-0 py-3 transition-[border-color,box-shadow] duration-300",
        running && "border-primary/50 shadow-primary/10 shadow-lg",
      )}
    >
      <form
        className="flex flex-wrap items-center gap-2 px-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (running) stop.mutate();
          else start.mutate({ description, projectId });
        }}
      >
        {running ? (
          <Input
            key={running.id}
            className="min-w-0 flex-1 border-transparent text-base shadow-none focus-visible:border-ring dark:bg-transparent"
            defaultValue={running.description}
            placeholder="What are you working on?"
            onBlur={(e) => {
              if (e.target.value !== running.description) update.mutate({ description: e.target.value });
            }}
          />
        ) : (
          <Input
            className="min-w-0 flex-1 border-transparent text-base shadow-none focus-visible:border-ring dark:bg-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What are you working on?"
          />
        )}
        <ProjectSelect
          projects={projects.data ?? []}
          value={running ? running.projectId : projectId}
          onChange={(id) => (running ? update.mutate({ projectId: id }) : setProjectId(id))}
        />
        <div className="flex w-32 items-center justify-end gap-2">
          <AnimatePresence>
            {running && (
              <motion.span
                key="dot"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="relative flex size-2"
                aria-hidden
              >
                <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-60" />
                <span className="bg-primary relative inline-flex size-2 rounded-full" />
              </motion.span>
            )}
          </AnimatePresence>
          <span
            className={cn(
              "font-mono text-xl tabular-nums transition-colors",
              running ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {running ? formatDuration(entryDurationMs(running, now)) : "0:00:00"}
          </span>
        </div>
        <motion.div whileTap={{ scale: 0.94 }}>
          <Button
            type="submit"
            size="lg"
            variant={running ? "destructive" : "default"}
            disabled={start.isPending || stop.isPending || current.isLoading}
            className="w-28"
          >
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={running ? "stop" : "start"}
                initial={{ y: 12, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -12, opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2"
              >
                {running ? <Square className="fill-current" /> : <Play className="fill-current" />}
                {running ? "Stop" : "Start"}
              </motion.span>
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>
    </Card>
  );
}
