import { useMemo } from "react";
import type { ToolResultContent } from "@/lib/conversation-schema/content/ToolResultContentSchema";
import { useSessionQuery } from "./useSessionQuery";

type SessionQueryData = NonNullable<ReturnType<typeof useSessionQuery>["data"]>;
type Session = NonNullable<SessionQueryData["session"]>;

type SessionData = {
  session: Session;
  conversations: Session["conversations"];
  getToolResult: (toolUseId: string) => ToolResultContent | undefined;
};

const buildSessionData = (session: Session): SessionData => {
  const entries = session.conversations.flatMap((conversation) => {
    if (conversation.type !== "user") {
      return [];
    }

    if (typeof conversation.message.content === "string") {
      return [];
    }

    return conversation.message.content.flatMap((message) => {
      if (typeof message === "string") {
        return [];
      }

      if (message.type !== "tool_result") {
        return [];
      }

      const entry: [string, ToolResultContent] = [message.tool_use_id, message];
      return [entry];
    });
  });

  const toolResultMap = new Map(entries);

  return {
    session,
    conversations: session.conversations,
    getToolResult: (toolUseId: string) => toolResultMap.get(toolUseId),
  };
};

export const useSession = (projectId: string, sessionId: string) => {
  const query = useSessionQuery(projectId, sessionId);
  const session = query.data?.session;
  if (session === undefined || session === null) {
    throw new Error("Session not found");
  }

  return useMemo(() => buildSessionData(session), [session]);
};

export const useSessionOrNull = (projectId: string, sessionId: string) => {
  const query = useSessionQuery(projectId, sessionId);
  const session = query.data?.session;

  return useMemo(() => {
    if (session === undefined || session === null) {
      return null;
    }
    return buildSessionData(session);
  }, [session]);
};
