"use client";

import type { RouterOutputs } from "@dct/api";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

type Project = RouterOutputs["project"]["list"][number];

const NONE = "__none__";

export function ProjectDot({ color, className }: { color: string; className?: string }) {
  return <span className={cn("size-2.5 shrink-0 rounded-full", className)} style={{ backgroundColor: color }} />;
}

export function ProjectSelect({
  projects,
  value,
  onChange,
  className,
}: {
  projects: Project[];
  value: string | null;
  onChange: (projectId: string | null) => void;
  className?: string;
}) {
  return (
    <Select value={value ?? NONE} onValueChange={(v) => onChange(v === NONE ? null : v)}>
      <SelectTrigger aria-label="Project" className={cn("w-44", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={NONE}>
          <ProjectDot color="var(--muted-foreground)" className="opacity-40" />
          No project
        </SelectItem>
        {projects.length > 0 && <SelectSeparator />}
        {projects.map((p) => (
          <SelectItem key={p.id} value={p.id}>
            <ProjectDot color={p.color} />
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
