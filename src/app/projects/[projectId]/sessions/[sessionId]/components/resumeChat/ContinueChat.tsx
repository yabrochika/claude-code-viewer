import { useLingui } from "@lingui/react";
import { type FC, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useConfig } from "../../../../../../hooks/useConfig";
import {
  ChatInput,
  type MessageInput,
  useContinueSessionProcessMutation,
} from "../../../../components/chatForm";
import { sessionPresets } from "../sessionPresets";

export const ContinueChat: FC<{
  projectId: string;
  sessionId: string;
  sessionProcessId: string;
  sessionProcessStatus?: "running" | "paused";
}> = ({ projectId, sessionId, sessionProcessId, sessionProcessStatus }) => {
  const { i18n } = useLingui();
  const continueSessionProcess = useContinueSessionProcessMutation(
    projectId,
    sessionId,
  );
  const [queuedInputs, setQueuedInputs] = useState<MessageInput[]>([]);
  const [isQueueBlockedByError, setIsQueueBlockedByError] = useState(false);
  const { config } = useConfig();

  const isRunning = sessionProcessStatus === "running";

  const handleSubmit = async (input: MessageInput) => {
    if (
      isRunning ||
      continueSessionProcess.isPending ||
      queuedInputs.length > 0
    ) {
      setIsQueueBlockedByError(false);
      setQueuedInputs((prev) => [...prev, input]);
      return;
    }

    await continueSessionProcess.mutateAsync({ input, sessionProcessId });
  };

  const getPlaceholder = () => {
    const behavior = config?.enterKeyBehavior;
    if (behavior === "enter-send") {
      return i18n._({
        id: "chat.placeholder.continue.enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Enter to send)",
      });
    }
    if (behavior === "command-enter-send") {
      return i18n._({
        id: "chat.placeholder.continue.command_enter",
        message:
          "Type your message... (Start with / for commands, @ for files, Command+Enter to send)",
      });
    }
    return i18n._({
      id: "chat.placeholder.continue.shift_enter",
      message:
        "Type your message... (Start with / for commands, @ for files, Shift+Enter to send)",
    });
  };

  useEffect(() => {
    if (
      isRunning ||
      continueSessionProcess.isPending ||
      isQueueBlockedByError ||
      queuedInputs.length === 0
    ) {
      return;
    }

    const nextInput = queuedInputs[0];
    if (nextInput === undefined) {
      return;
    }

    void continueSessionProcess
      .mutateAsync({ input: nextInput, sessionProcessId })
      .then(() => {
        setQueuedInputs((prev) => prev.slice(1));
      })
      .catch(() => {
        setIsQueueBlockedByError(true);
      });
  }, [
    continueSessionProcess,
    isQueueBlockedByError,
    isRunning,
    queuedInputs,
    sessionProcessId,
  ]);

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 pb-3">
      <ChatInput
        projectId={projectId}
        onSubmit={handleSubmit}
        isPending={continueSessionProcess.isPending}
        error={continueSessionProcess.error}
        placeholder={getPlaceholder()}
        buttonText={`＋完了後送信${queuedInputs.length > 0 ? ` (${queuedInputs.length})` : ""}`}
        containerClassName=""
        buttonSize="default"
        enableScheduledSend={false}
        baseSessionId={sessionId}
        disabled={false}
        presets={sessionPresets}
      />
      {isQueueBlockedByError && queuedInputs.length > 0 && (
        <div className="mt-2 flex items-center justify-end gap-2">
          <p className="text-xs text-muted-foreground">
            {i18n._({
              id: "session.status.paused",
            })}
            {i18n._({
              id: "chat.queue.paused_suffix",
              message: " (Queue paused)",
            })}
          </p>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setIsQueueBlockedByError(false)}
            disabled={continueSessionProcess.isPending}
          >
            {i18n._({
              id: "assistant.tool.retry",
              message: "Retry",
            })}
          </Button>
        </div>
      )}
    </div>
  );
};
