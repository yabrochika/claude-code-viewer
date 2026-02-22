import { FileSystem, Path } from "@effect/platform";
import { Context, Effect, Layer, Option, Ref } from "effect";
import { z } from "zod";
import type { InferEffect } from "../../../lib/effect/types";
import {
  FileCacheStorage,
  makeFileCacheStorageLayer,
} from "../../../lib/storage/FileCacheStorage";
import { PersistentService } from "../../../lib/storage/FileCacheStorage/PersistentService";
import { parseJsonl } from "../../claude-code/functions/parseJsonl";
import type { ProjectMeta } from "../../types";
import { decodeProjectId } from "../functions/id";

const ProjectPathSchema = z.string().nullable();

const LayerImpl = Effect.gen(function* () {
  const fs = yield* FileSystem.FileSystem;
  const path = yield* Path.Path;
  const projectPathCache = yield* FileCacheStorage<string | null>();
  const projectMetaCacheRef = yield* Ref.make(new Map<string, ProjectMeta>());

  const findCwdInUnknown = (value: unknown): string | null => {
    if (typeof value !== "object" || value === null) {
      return null;
    }

    if ("cwd" in value) {
      const cwd = Reflect.get(value, "cwd");
      if (typeof cwd === "string") {
        return cwd;
      }
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = findCwdInUnknown(item);
        if (found !== null) {
          return found;
        }
      }
      return null;
    }

    for (const child of Object.values(value)) {
      const found = findCwdInUnknown(child);
      if (found !== null) {
        return found;
      }
    }

    return null;
  };

  const extractCwdFromRawJson = (line: string): string | null => {
    try {
      return findCwdInUnknown(JSON.parse(line));
    } catch {
      return null;
    }
  };

  const inferProjectPathFromClaudeProjectPath = (
    claudeProjectPath: string,
  ): Effect.Effect<string | null, Error> =>
    Effect.gen(function* () {
      const encodedProjectName = path.basename(claudeProjectPath);
      const tokens = encodedProjectName.split("-");

      if (tokens.length === 0) {
        return null;
      }

      const firstToken = tokens[0] ?? "";
      const isWindowsDrive = /^[A-Za-z]:$/.test(firstToken);
      const isPosixRoot = firstToken === "";

      if (!isWindowsDrive && !isPosixRoot) {
        return null;
      }

      const resolveSegments = (
        currentPath: string,
        tokenIndex: number,
      ): Effect.Effect<string | null, Error> =>
        Effect.gen(function* () {
          if (tokenIndex >= tokens.length) {
            return currentPath.replace(/[\\/]+$/, "");
          }

          for (let end = tokenIndex + 1; end <= tokens.length; end++) {
            const segment = tokens.slice(tokenIndex, end).join("-");
            if (segment.length === 0) {
              continue;
            }

            const candidate = path.join(currentPath, segment);
            const exists = yield* fs.exists(candidate);
            if (!exists) {
              continue;
            }

            const resolved = yield* resolveSegments(candidate, end);
            if (resolved !== null) {
              return resolved;
            }
          }

          return null;
        });

      const basePath = isWindowsDrive ? `${firstToken}${path.sep}` : path.sep;
      return yield* resolveSegments(basePath, 1);
    });

  const extractProjectPathFromJsonl = (
    filePath: string,
  ): Effect.Effect<string | null, Error> =>
    Effect.gen(function* () {
      const cached = yield* projectPathCache.get(filePath);
      if (cached !== undefined) {
        return cached;
      }

      const content = yield* fs.readFileString(filePath);
      const lines = content.split("\n");

      let cwd: string | null = null;

      for (const line of lines) {
        const conversation = parseJsonl(line).at(0);

        if (
          conversation === undefined ||
          conversation.type === "summary" ||
          conversation.type === "x-error" ||
          conversation.type === "file-history-snapshot" ||
          conversation.type === "queue-operation" ||
          conversation.type === "custom-title" ||
          conversation.type === "agent-name"
        ) {
          const fallbackCwd = extractCwdFromRawJson(line);
          if (fallbackCwd !== null) {
            cwd = fallbackCwd;
            break;
          }
          continue;
        }

        cwd = conversation.cwd;
        break;
      }

      if (cwd !== null) {
        yield* projectPathCache.set(filePath, cwd);
      }

      return cwd;
    });

  const getProjectMeta = (
    projectId: string,
  ): Effect.Effect<ProjectMeta, Error> =>
    Effect.gen(function* () {
      const metaCache = yield* Ref.get(projectMetaCacheRef);
      const cached = metaCache.get(projectId);
      if (cached !== undefined) {
        return cached;
      }

      const claudeProjectPath = decodeProjectId(projectId);

      const dirents = yield* fs.readDirectory(claudeProjectPath);
      const fileEntries = yield* Effect.all(
        dirents
          .filter((name) => name.endsWith(".jsonl"))
          .map((name) =>
            Effect.gen(function* () {
              const fullPath = path.resolve(claudeProjectPath, name);
              const stat = yield* fs.stat(fullPath);
              const mtime = Option.getOrElse(stat.mtime, () => new Date(0));
              return {
                fullPath,
                mtime,
              } as const;
            }),
          ),
        { concurrency: "unbounded" },
      );

      const files = fileEntries.sort((a, b) => {
        return a.mtime.getTime() - b.mtime.getTime();
      });

      let projectPath: string | null = null;

      for (const file of files) {
        projectPath = yield* extractProjectPathFromJsonl(file.fullPath);

        if (projectPath === null) {
          continue;
        }

        break;
      }

      if (projectPath === null) {
        projectPath =
          yield* inferProjectPathFromClaudeProjectPath(claudeProjectPath);
      }

      const projectMeta: ProjectMeta = {
        projectName: projectPath ? path.basename(projectPath) : null,
        projectPath,
        sessionCount: files.length,
      };

      yield* Ref.update(projectMetaCacheRef, (cache) => {
        cache.set(projectId, projectMeta);
        return cache;
      });

      return projectMeta;
    });

  const invalidateProject = (projectId: string): Effect.Effect<void> =>
    Effect.gen(function* () {
      yield* Ref.update(projectMetaCacheRef, (cache) => {
        cache.delete(projectId);
        return cache;
      });
    });

  return {
    getProjectMeta,
    invalidateProject,
  };
});

export type IProjectMetaService = InferEffect<typeof LayerImpl>;

export class ProjectMetaService extends Context.Tag("ProjectMetaService")<
  ProjectMetaService,
  IProjectMetaService
>() {
  static Live = Layer.effect(this, LayerImpl).pipe(
    Layer.provide(
      makeFileCacheStorageLayer("project-path-cache", ProjectPathSchema),
    ),
    Layer.provide(PersistentService.Live),
  );
}
