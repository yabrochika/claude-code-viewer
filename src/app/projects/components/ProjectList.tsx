import { Trans } from "@lingui/react";
import { Link } from "@tanstack/react-router";
import { CalendarDaysIcon, FolderIcon, MessagesSquareIcon } from "lucide-react";
import type { FC } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { formatLocaleDate } from "../../../lib/date/formatLocaleDate";
import { useConfig } from "../../hooks/useConfig";
import { useProjects } from "../hooks/useProjects";

export const ProjectList: FC = () => {
  const {
    data: { projects },
  } = useProjects();
  const { config } = useConfig();

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
    <div className="space-y-4">
      {projects.map((project) => (
        <Link
          key={project.id}
          to={"/projects/$projectId/session"}
          params={{ projectId: project.id }}
          className="block"
        >
          <Card className="transition-colors hover:bg-muted/20">
            <CardContent className="py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <CardTitle className="flex items-center gap-2 justify-start items-start text-base">
                    <FolderIcon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span className="text-wrap flex-1">
                      {project.meta.projectName ?? project.claudeProjectPath}
                    </span>
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {project.meta.projectPath ?? project.claudeProjectPath}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
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
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
};
