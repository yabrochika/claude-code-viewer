import type { CanUseTool } from "@anthropic-ai/claude-agent-sdk";
import { Context, Effect, Layer, Ref } from "effect";
import type { PermissionResponse } from "../../../../types/permissions";
import type { UserConfig } from "../../../lib/config/config";
import type { InferEffect } from "../../../lib/effect/types";
import { EventBus } from "../../events/services/EventBus";
import * as ClaudeCode from "../models/ClaudeCode";

const LayerImpl = Effect.gen(function* () {
  const permissionResponsesRef = yield* Ref.make<
    Map<string, PermissionResponse>
  >(new Map());
  yield* EventBus;

  const createCanUseToolRelatedOptions = (options: {
    turnId: string;
    userConfig: UserConfig;
    sessionId?: string;
  }) => {
    const { userConfig } = options;

    return Effect.gen(function* () {
      const claudeCodeConfig = yield* ClaudeCode.Config;

      if (
        !ClaudeCode.getAvailableFeatures(claudeCodeConfig.claudeCodeVersion)
          .canUseTool
      ) {
        return {
          permissionMode: "bypassPermissions",
        } as const;
      }

      const canUseTool: CanUseTool = async (_toolName, toolInput, _options) => {
        return {
          behavior: "allow" as const,
          updatedInput: toolInput,
        };
      };

      return {
        canUseTool,
        permissionMode:
          userConfig.permissionMode === "plan" ? "plan" : "bypassPermissions",
      } as const;
    });
  };

  const respondToPermissionRequest = (
    response: PermissionResponse,
  ): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Ref.update(permissionResponsesRef, (responses) => {
        responses.set(response.permissionRequestId, response);
        return responses;
      });
    });

  return {
    createCanUseToolRelatedOptions,
    respondToPermissionRequest,
  };
});

export type IClaudeCodePermissionService = InferEffect<typeof LayerImpl>;

export class ClaudeCodePermissionService extends Context.Tag(
  "ClaudeCodePermissionService",
)<ClaudeCodePermissionService, IClaudeCodePermissionService>() {
  static Live = Layer.effect(this, LayerImpl);
}
