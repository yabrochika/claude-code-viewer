import { ConversationSchema } from "../../../../lib/conversation-schema";
import type { ErrorJsonl, ExtendedConversation } from "../../types";

export const parseJsonl = (content: string): ExtendedConversation[] => {
  const lines = content
    .trim()
    .split("\n")
    .filter((line) => line.trim() !== "");

  return lines.map((line, index) => {
    let rawJson: unknown;
    try {
      rawJson = JSON.parse(line);
    } catch {
      const errorData: ErrorJsonl = {
        type: "x-error",
        line,
        lineNumber: index + 1,
      };
      return errorData;
    }

    const parsed = ConversationSchema.safeParse(rawJson);
    if (!parsed.success) {
      const errorData: ErrorJsonl = {
        type: "x-error",
        line,
        lineNumber: index + 1,
      };
      return errorData;
    }

    return parsed.data;
  });
};
