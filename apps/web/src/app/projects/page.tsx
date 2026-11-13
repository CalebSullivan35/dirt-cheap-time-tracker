import { auth } from "@clerk/nextjs/server";
import { ProjectsManager } from "@/components/projects-manager";

export default async function ProjectsPage() {
  await auth.protect();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
        <p className="text-muted-foreground text-sm">
          Projects belong to the workspace selected in the top right. Switch to an organization to share them with
          your team.
        </p>
      </div>
      <ProjectsManager />
    </div>
  );
}
