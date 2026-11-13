"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock, Play, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { entryDurationMs, formatDurationShort, groupEntriesByDay } from "@dct/validators";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useTRPC } from "@/trpc/react";
import { formatClock, formatDayHeading } from "./datetime";
import { ProjectDot } from "./project-select";

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
  const onError = (e: { message: string }) => toast.error(e.message);
  const remove = useMutation(
    trpc.entry.delete.mutationOptions({
      onSuccess: async () => {
        toast("Entry deleted");
        await invalidate();
      },
      onError,
    }),
  );
  const restart = useMutation(trpc.timer.start.mutationOptions({ onSuccess: invalidate, onError }));

  if (entries.isLoading)
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-28 w-full rounded-xl" />
      </div>
    );
  if (entries.error) return <p className="text-destructive text-sm">{entries.error.message}</p>;
  if (!entries.data?.length)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center text-sm"
      >
        <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-full">
          <Clock className="size-5" />
        </span>
        No time tracked yet. Start the timer or add an entry manually.
      </motion.div>
    );

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence initial={false}>
        {groupEntriesByDay(entries.data).map((group) => (
          <motion.section
            key={group.day}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <h2 className="text-muted-foreground mb-2 flex justify-between px-1 text-sm font-medium">
              <span>{formatDayHeading(group.day)}</span>
              <span className="text-foreground tabular-nums">{formatDurationShort(group.totalMs)}</span>
            </h2>
            <Card className="gap-0 overflow-hidden py-0">
              <ul>
                <AnimatePresence initial={false}>
                  {group.entries.map((entry) => {
                    const project = entry.projectId ? projectById.get(entry.projectId) : undefined;
                    return (
                      <motion.li
                        key={entry.id}
                        layout
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="group border-b last:border-b-0"
                      >
                        <div className="hover:bg-muted/50 flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm transition-colors">
                          <span className="min-w-0 flex-1 truncate">
                            {entry.description || (
                              <span className="text-muted-foreground italic">No description</span>
                            )}
                          </span>
                          {project && (
                            <span className="bg-muted flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs">
                              <ProjectDot color={project.color} className="size-2" />
                              {project.name}
                            </span>
                          )}
                          <span className="text-muted-foreground tabular-nums">
                            {formatClock(entry.startedAt)} – {formatClock(entry.endedAt!)}
                          </span>
                          <span className="w-16 text-right font-medium tabular-nums">
                            {formatDurationShort(entryDurationMs(entry))}
                          </span>
                          <div className="flex opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-within:opacity-100">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Continue this entry"
                                  onClick={() =>
                                    restart.mutate({
                                      description: entry.description,
                                      projectId: project && !project.archivedAt ? project.id : null,
                                    })
                                  }
                                >
                                  <Play />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Continue</TooltipContent>
                            </Tooltip>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  aria-label="Delete entry"
                                  className="hover:text-destructive"
                                >
                                  <Trash2 />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {formatDurationShort(entryDurationMs(entry))}
                                    {entry.description ? ` of “${entry.description}”` : ""} will be
                                    removed. This can&apos;t be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90 text-white"
                                    onClick={() => remove.mutate({ id: entry.id })}
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            </Card>
          </motion.section>
        ))}
      </AnimatePresence>
    </div>
  );
}
