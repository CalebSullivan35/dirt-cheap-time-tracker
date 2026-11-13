"use client";

import type { RouterOutputs } from "@dct/api";

type Project = RouterOutputs["project"]["list"][number];

export function ProjectSelect({
  projects,
  value,
  onChange,
  className = "",
}: {
  projects: Project[];
  value: string | null;
  onChange: (projectId: string | null) => void;
  className?: string;
}) {
  return (
    <select
      aria-label="Project"
      className={`input ${className}`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
    >
      <option value="">No project</option>
      {projects.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </select>
  );
}
