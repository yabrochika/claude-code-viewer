import { Trans } from "@lingui/react";
import { Link, useSearch } from "@tanstack/react-router";
import { useAtomValue } from "jotai";
import { MessageSquareIcon, PlusIcon } from "lucide-react";
import { type FC, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatLocaleDate } from "../../../../../../../lib/date/formatLocaleDate";
import { useConfig } from "../../../../../../hooks/useConfig";
import { useProject } from "../../../../hooks/useProject";
import { firstUserMessageToTitle } from "../../../../services/firstCommandToTitle";
import { sessionProcessesAtom } from "../../store/sessionProcessesAtom";
import { AddWorktreeModal } from "./AddWorktreeModal";

export const SessionsTab: FC<{
  currentSessionId: string;
  projectId: string;
  isMobile?: boolean;
}> = ({ currentSessionId, projectId }) => {
  const [isAddWorktreeModalOpen, setIsAddWorktreeModalOpen] = useState(false);
  const {
    data: projectData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useProject(projectId);
  const sessions = projectData.pages.flatMap((page) => page.sessions);

  const sessionProcesses = useAtomValue(sessionProcessesAtom);
  const { config } = useConfig();
  const search = useSearch({
    from: "/projects/$projectId/session",
  });
  // Preserve current tab state or default to "sessions"
  const currentTab = search.tab ?? "sessions";

  // Sort sessions: Running > Paused > Others, then by lastModifiedAt (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    const aProcess = sessionProcesses.find(
      (process) => process.sessionId === a.id,
    );
    const bProcess = sessionProcesses.find(
      (process) => process.sessionId === b.id,
    );

    const aStatus = aProcess?.status;
    const bStatus = bProcess?.status;

    // Define priority: running = 0, paused = 1, others = 2
    const getPriority = (status: "paused" | "running" | undefined) => {
      if (status === "running") return 0;
      if (status === "paused") return 1;
      return 2;
    };

    const aPriority = getPriority(aStatus);
    const bPriority = getPriority(bStatus);

    // First sort by priority
    if (aPriority !== bPriority) {
      return aPriority - bPriority;
    }

    // Then sort by lastModifiedAt (newest first)
    const aTime = a.lastModifiedAt ? new Date(a.lastModifiedAt).getTime() : 0;
    const bTime = b.lastModifiedAt ? new Date(b.lastModifiedAt).getTime() : 0;
    return bTime - aTime;
  });

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between mb-1.5">
          <h2 className="font-semibold text-sm text-sidebar-foreground">
            ワークスペース
          </h2>
          <Button
            variant="secondary"
            size="sm"
            className="h-7 px-2 text-xs gap-1.5"
            onClick={() => setIsAddWorktreeModalOpen(true)}
          >
            <PlusIcon className="w-3.5 h-3.5" />
            追加
          </Button>
        </div>
        <p className="text-[10px] text-sidebar-foreground/60">
          {sessions.length}件のワークスペース
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-[#070f24]">
        <button
          type="button"
          className={cn(
            "block w-full rounded-xl p-2.5 transition-all duration-200 border border-blue-800/60 hover:border-blue-500/80 bg-[#0b1a3d] hover:bg-[#0f2456]",
          )}
          onClick={() => setIsAddWorktreeModalOpen(true)}
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-blue-300">
              <PlusIcon className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-blue-100">新規</p>
            </div>
          </div>
        </button>
        {sortedSessions.map((session) => {
          const isActive = session.id === currentSessionId;
          const title =
            session.meta.firstUserMessage !== null
              ? firstUserMessageToTitle(session.meta.firstUserMessage)
              : session.id;

          const sessionProcess = sessionProcesses.find(
            (task) => task.sessionId === session.id,
          );
          const isRunning = sessionProcess?.status === "running";
          const isPaused = sessionProcess?.status === "paused";

          return (
            <Link
              key={session.id}
              to="/projects/$projectId/session"
              params={{ projectId }}
              search={(prev) => ({
                ...prev,
                tab: currentTab,
                sessionId: session.id,
              })}
              className={cn(
                "group relative block rounded-xl p-2.5 transition-all duration-200 border border-blue-800/60 bg-[#0b1a3d] hover:bg-[#0f2456] hover:border-blue-500/80 hover:shadow-sm",
                isActive && "border-blue-400 shadow-md ring-1 ring-blue-500/40",
              )}
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2 pr-6">
                  <h3 className="text-sm font-medium line-clamp-2 leading-tight text-blue-100 flex-1">
                    {title}
                  </h3>
                  {(isRunning || isPaused) && (
                    <Badge
                      variant={isRunning ? "default" : "secondary"}
                      className={cn(
                        "text-xs shrink-0",
                        isRunning && "bg-green-500 text-white",
                        isPaused && "bg-yellow-500 text-white",
                      )}
                    >
                      {isRunning ? (
                        <Trans id="session.status.running" />
                      ) : (
                        <Trans id="session.status.paused" />
                      )}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs text-blue-200/70 min-w-0">
                    <div className="flex items-center gap-1">
                      <MessageSquareIcon className="w-3 h-3" />
                      <span>{session.meta.messageCount}</span>
                    </div>
                  </div>
                  {session.lastModifiedAt && (
                    <span className="text-xs text-blue-200/60 shrink-0">
                      {formatLocaleDate(session.lastModifiedAt, {
                        locale: config.locale,
                        target: "time",
                      })}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}

        {/* Load More Button */}
        {hasNextPage && fetchNextPage && (
          <div className="p-2">
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {isFetchingNextPage ? (
                <Trans id="common.loading" />
              ) : (
                <Trans id="sessions.load.more" />
              )}
            </Button>
          </div>
        )}
      </div>
      <AddWorktreeModal
        open={isAddWorktreeModalOpen}
        onOpenChange={setIsAddWorktreeModalOpen}
      />
    </div>
  );
};
