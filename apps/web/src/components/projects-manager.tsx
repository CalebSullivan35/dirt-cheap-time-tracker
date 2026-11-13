"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { PROJECT_COLORS } from "@dct/validators";
import { useTRPC } from "@/trpc/react";

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Color">
      {PROJECT_COLORS.map((c) => (
        <button
          key={c}
          type="button"
          role="radio"
          aria-checked={value === c}
          aria-label={c}
          className={`size-6 rounded-full border-2 ${value === c ? "border-foreground" : "border-transparent"}`}
          style={{ backgroundColor: c }}
          onClick={() => onChange(c)}
        />
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

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: trpc.project.list.queryKey() });
  const create = useMutation(
    trpc.project.create.mutationOptions({
      onSuccess: async () => {
        setName("");
        await invalidate();
      },
    }),
  );
  const update = useMutation(trpc.project.update.mutationOptions({ onSuccess: invalidate }));

  return (
    <div className="flex flex-col gap-4">
      <form
        className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          create.mutate({ name, color });
        }}
      >
        <input
          className="input min-w-0 flex-1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name"
          required
        />
        <ColorPicker value={color} onChange={setColor} />
        <button className="btn-primary" disabled={create.isPending}>
          Create project
        </button>
        {create.error && <p className="w-full text-sm text-danger">{create.error.message}</p>}
      </form>

      <label className="flex items-center gap-2 text-sm text-muted">
        <input
          type="checkbox"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
        Show archived
      </label>

      {projects.isLoading ? (
        <p className="text-sm text-muted">Loading projects…</p>
      ) : !projects.data?.length ? (
        <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted">
          No projects yet.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
          {projects.data.map((p) => (
            <li key={p.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              <span className="size-3 rounded-full" style={{ backgroundColor: p.color }} />
              <input
                key={`${p.id}-${p.name}`}
                className="min-w-0 flex-1 bg-transparent outline-none focus:underline"
                defaultValue={p.name}
                aria-label="Project name"
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (next && next !== p.name) update.mutate({ id: p.id, name: next });
                  else e.target.value = p.name;
                }}
              />
              {p.archivedAt && <span className="text-xs text-muted">Archived</span>}
              <button
                className="btn-ghost px-2 py-1"
                onClick={() => update.mutate({ id: p.id, archived: !p.archivedAt })}
              >
                {p.archivedAt ? "Restore" : "Archive"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
