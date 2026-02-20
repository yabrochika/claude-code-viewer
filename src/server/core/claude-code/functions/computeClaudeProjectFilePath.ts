import { Path } from "@effect/platform";
import { Effect } from "effect";

export const computeClaudeProjectFilePath = (options: {
  projectPath: string;
  claudeProjectsDirPath: string;
}) =>
  Effect.gen(function* () {
    const path = yield* Path.Path;
    const { projectPath, claudeProjectsDirPath } = options;
    const normalizedProjectPath = projectPath.replace(/\\/g, "/");
    const trimmedProjectPath = normalizedProjectPath.replace(/\/$/, "");

    return path.join(
      claudeProjectsDirPath,
      trimmedProjectPath.replace(/\//g, "-"),
    );
  });
