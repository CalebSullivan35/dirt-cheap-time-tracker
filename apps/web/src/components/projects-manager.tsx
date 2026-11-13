"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, ArchiveRestore, Check, FolderKanban } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { PROJECT_COLORS } from "@dct/validators";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/react";
import { ProjectDot } from "./project-select";

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1.5" role="radiogroup" aria-label="Color">
      {PROJECT_COLORS.map((c) => (
        <motion.button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className={cn(
            "ring-offset-background grid size-6 cursor-pointer place-items-center rounded-full text-white ring-offset-2 transition-shadow",
            value === c && "ring-foreground/60 ring-2",
          )}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        >
          {value === c && <Check className="size-3.5" />}
        </motion.button>
      ))}
    </div>
  );
}

export function ProjectsManager() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [showArchived, setShowArchived] = useState(false);
  const projects = useQuery(trpc.project.list.queryOptions({ includeArchived: showArchived }));
  const [name, setName] = useState("");
  const [color, setColor] = useState<string>(PROJECT_COLORS[0]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: trpc.project.list.queryKey() });
  const onError = (e: { message: string }) => toast.error(e.message);
  const create = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: async (p) => {
        toast.success(`Created “${p.name}”`);
        setName("");
        await invalidate();
      },
      onError,
    }),
  );
  const update = useMutation(trpc.project.update.mutationOptions({ onSuccess: invalidate, onError }));

  return (
    <div className="flex flex-col gap-4">
      <Card className="p-4">
        <form
          className="flex flex-wrap items-end gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate({ name, color });
          }}
        >
          <div className="grid min-w-48 flex-1 gap-1.5">
            <Label htmlFor="project-name">New project</Label>
            <Input
              id="project-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Client website"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label>Color</Label>
            <div className="flex h-9 items-center">
              <ColorPicker value={color} onChange={setColor} />
            </div>
          </div>
          <Button disabled={create.isPending}>Create project</Button>
        </form>
      </Card>

      <label className="text-muted-foreground flex w-fit cursor-pointer items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="accent-primary"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived
      </label>

      {projects.isLoading ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : !projects.data?.length ? (
        <div className="text-muted-foreground flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center text-sm">
          <span className="bg-accent text-accent-foreground grid size-10 place-items-center rounded-full">
            <FolderKanban className="size-5" />
          </span>
          No projects yet. Create one above.
        </div>
      ) : (
        <Card className="gap-0 overflow-hidden py-0">
          <ul>
            <AnimatePresence initial={false}>
              {projects.data.map((p) => (
                <motion.li
                  key={p.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-b last:border-b-0"
                >
                  <div className={cn("flex items-center gap-3 px-4 py-2.5 text-sm", p.archivedAt && "opacity-60")}>
                    <ProjectDot color={p.color} className="size-3" />
                    <input
                      key={`${p.id}-${p.name}`}
                      className="focus-visible:bg-muted min-w-0 flex-1 rounded-sm bg-transparent px-1 py-0.5 outline-none"
                      defaultValue={p.name}
                      aria-label="Project name"
                      onBlur={(e) => {
                        const next = e.target.value.trim();
                        if (next && next !== p.name) update.mutate({ id: p.id, name: next });
                        else e.target.value = p.name;
                      }}
                    />
                    {p.archivedAt && (
                      <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">Archived</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => update.mutate({ id: p.id, archived: !p.archivedAt })}
                    >
                      {p.archivedAt ? <ArchiveRestore /> : <Archive />}
                      {p.archivedAt ? "Restore" : "Archive"}
                    </Button>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Card>
      )}
    </div>
  );
}
