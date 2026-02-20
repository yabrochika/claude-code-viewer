import { Trans } from "@lingui/react";
import { type FC, Suspense } from "react";
import { GlobalSidebar } from "@/components/GlobalSidebar";
import { Badge } from "@/components/ui/badge";
import { AddWorktreeDialog } from "./components/AddWorktreeDialog";
import { ProjectList } from "./components/ProjectList";
import { SetupProjectDialog } from "./components/SetupProjectDialog";

export const ProjectsPage: FC = () => {
  return (
    <div className="flex h-screen max-h-screen overflow-hidden">
      <div className="h-full">
        <GlobalSidebar isContentHidden />
      </div>
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              Claude Code Viewer
              <Badge
                variant="secondary"
                className="text-[15px] px-2 py-0.5 leading-none bg-[#2aa23a] text-white"
              >
                JTCC
              </Badge>
            </h1>
            <p className="text-muted-foreground">
              <Trans id="projects.page.description" />
            </p>
          </header>

          <main>
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  <Trans id="projects.page.title" />
                </h2>
                <div className="flex items-center gap-2">
                  <AddWorktreeDialog />
                  <SetupProjectDialog />
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">
                      <Trans id="projects.page.loading" />
                    </div>
                  </div>
                }
              >
                <ProjectList />
              </Suspense>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};
