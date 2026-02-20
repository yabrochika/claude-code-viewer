import { Trans } from "@lingui/react";
import { Link } from "@tanstack/react-router";
import {
  CalendarDaysIcon,
  FolderIcon,
  MessagesSquareIcon,
  Trash2Icon,
} from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { formatLocaleDate } from "../../../lib/date/formatLocaleDate";
import { useConfig } from "../../hooks/useConfig";
import { useProjects } from "../hooks/useProjects";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

export const ProjectList: FC = () => {
  const {
    data: { projects },
  } = useProjects();
  const { config } = useConfig();
  const [targetProject, setTargetProject] = useState<{
    id: string;
    name: string;
  } | null>(null);

  if (projects.length === 0) {
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FolderIcon className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">
          <Trans id="project_list.no_projects.title" />
        </h3>
        <p className="text-muted-foreground text-center max-w-md">
          <Trans id="project_list.no_projects.description" />
        </p>
      </CardContent>
    </Card>;
  }

  return (
    <>
      <div className="space-y-4">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="transition-colors hover:bg-muted/20"
          >
            <CardContent className="py-5">
              <div className="flex items-start justify-between gap-4">
                <Link
                  to={"/projects/$projectId/session"}
                  params={{ projectId: project.id }}
                  className="min-w-0 flex-1 space-y-2"
                >
                  <CardTitle className="flex items-center gap-2 justify-start items-start text-base">
                    <FolderIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-wrap flex-1">
                      {project.meta.projectName ?? project.claudeProjectPath}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {project.meta.projectPath ?? project.claudeProjectPath}
                  </CardDescription>
                </Link>

                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                  <div className="flex items-center gap-1.5">
                    <MessagesSquareIcon className="w-3.5 h-3.5" />
                    <span>
                      <Trans id="project_list.messages" />{" "}
                      {project.meta.sessionCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarDaysIcon className="w-3.5 h-3.5" />
                    <span>
                      {project.lastModifiedAt
                        ? formatLocaleDate(project.lastModifiedAt, {
                            locale: config.locale,
                            target: "time",
                          })
                        : "-"}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() =>
                      setTargetProject({
                        id: project.id,
                        name:
                          project.meta.projectName ?? project.claudeProjectPath,
                      })
                    }
                    aria-label="Delete project"
                  >
                    <Trash2Icon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {targetProject !== null && (
        <DeleteProjectDialog
          open={targetProject !== null}
          onOpenChange={(open) => {
            if (!open) {
              setTargetProject(null);
            }
          }}
          projectId={targetProject.id}
          projectName={targetProject.name}
        />
      )}
    </>
  );
};
