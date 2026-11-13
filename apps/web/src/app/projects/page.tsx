import { auth } from "@clerk/nextjs/server";
import { ProjectsManager } from "@/components/projects-manager";

export default async function ProjectsPage() {
  await auth.protect();
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Projects</h1>
      <p className="text-sm text-muted">
        Projects belong to the workspace selected in the top right. Switch to an organization to
        share projects with your team.
      </p>
      <ProjectsManager />
    </div>
  );
}
