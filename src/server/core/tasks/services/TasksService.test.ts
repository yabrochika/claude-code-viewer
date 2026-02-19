import { homedir } from "node:os";
import { join, sep } from "node:path";
import { Path } from "@effect/platform";
import { Effect } from "effect";
import { describe, expect, it } from "vitest";
import {
  createFileInfo,
  testFileSystemLayer,
} from "../../../../testing/layers/testFileSystemLayer";
import { TasksService } from "./TasksService";

/**
 * Helper to get claude directory path for tests
 */
const getClaudeDir = () => join(homedir(), ".claude");
const testPathLayer = Path.layer;
const normalizePath = (value: string) => value.replace(/\\/g, "/");

describe("TasksService", () => {
  describe("listTasks", () => {
    it("uses native filesystem path separators", async () => {
      const observedPaths: Array<string> = [];
      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks("/test/project");
      });

      await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => {
                observedPaths.push(path);
                return Effect.succeed(false);
              },
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(observedPaths.length).toBeGreaterThan(0);
      const containsUnexpectedSeparator = observedPaths.some((path) =>
        sep === "\\" ? path.includes("/") : path.includes("\\"),
      );
      expect(containsUnexpectedSeparator).toBe(false);
    });

    it("returns empty array when project metadata directory does not exist", async () => {
      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks("/non/existent/project");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: () => Effect.succeed(false),
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toEqual([]);
    });

    it("returns empty array when no UUID file found in project metadata directory", async () => {
      const claudeDir = getClaudeDir();
      const projectMetaDir = join(claudeDir, "projects", "-test-project");

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks("/test/project");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => Effect.succeed(path === projectMetaDir),
              readDirectory: () => Effect.succeed([]), // No UUID files
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toEqual([]);
    });

    it("returns empty array when specific sessionId tasks directory does not exist", async () => {
      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks(
          "/test/project",
          "non-existent-session-id",
        );
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: () => Effect.succeed(false), // Session tasks dir does not exist
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toEqual([]);
    });

    it("returns empty array when tasks directory does not exist for resolved UUID", async () => {
      const uuid = "12345678-1234-1234-1234-123456789abc";
      const claudeDir = getClaudeDir();
      const projectMetaDir = join(claudeDir, "projects", "-test-project");
      const tasksDir = join(claudeDir, "tasks", uuid);

      // Track which paths exist
      const existsMap = new Map<string, boolean>([
        [projectMetaDir, true],
        [tasksDir, false], // Tasks dir does not exist
      ]);

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks("/test/project");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => Effect.succeed(existsMap.get(path) ?? false),
              readDirectory: (path) => {
                if (path === projectMetaDir) {
                  return Effect.succeed([`${uuid}.json`]);
                }
                return Effect.succeed([]);
              },
              stat: () => Effect.succeed(createFileInfo({})),
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toEqual([]);
    });

    it("returns tasks when tasks directory exists and contains valid task files", async () => {
      const uuid = "12345678-1234-1234-1234-123456789abc";
      const claudeDir = getClaudeDir();
      const projectMetaDir = join(claudeDir, "projects", "-test-project");
      const tasksDir = join(claudeDir, "tasks", uuid);

      const existsMap = new Map<string, boolean>([
        [projectMetaDir, true],
        [tasksDir, true],
      ]);

      const taskData = {
        id: "1",
        subject: "Test task",
        description: "Test description",
        status: "pending",
        blocks: [],
        blockedBy: [],
      };

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks("/test/project");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => Effect.succeed(existsMap.get(path) ?? false),
              readDirectory: (path) => {
                if (path === projectMetaDir) {
                  return Effect.succeed([`${uuid}.json`]);
                }
                if (path === tasksDir) {
                  return Effect.succeed(["1.json"]);
                }
                return Effect.succeed([]);
              },
              stat: () => Effect.succeed(createFileInfo({})),
              readFileString: () => Effect.succeed(JSON.stringify(taskData)),
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.subject).toBe("Test task");
    });

    it("accepts normalized metadata path with forward slashes", async () => {
      const uuid = "12345678-1234-1234-1234-123456789abc";
      const claudeDir = getClaudeDir();
      const metadataProjectPathForInput =
        sep === "\\"
          ? `${claudeDir.replace(/\\/g, "/")}/projects/-test-project`
          : "";
      const metadataProjectPath = join(claudeDir, "projects", "-test-project");
      const tasksDir = join(claudeDir, "tasks", uuid);

      const existsMap = new Map<string, boolean>([
        [normalizePath(metadataProjectPath), true],
        [normalizePath(tasksDir), true],
      ]);

      const taskData = {
        id: "1",
        subject: "Normalized path task",
        description: "metadata path with forward slashes",
        status: "pending",
        blocks: [],
        blockedBy: [],
      };

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.listTasks(
          sep === "\\" ? metadataProjectPathForInput : metadataProjectPath,
        );
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) =>
                Effect.succeed(existsMap.get(normalizePath(path)) ?? false),
              readDirectory: (path) => {
                const normalizedPath = normalizePath(path);
                if (normalizedPath === normalizePath(metadataProjectPath)) {
                  return Effect.succeed([`${uuid}.json`]);
                }
                if (normalizedPath === normalizePath(tasksDir)) {
                  return Effect.succeed(["1.json"]);
                }
                return Effect.succeed([]);
              },
              stat: () => Effect.succeed(createFileInfo({})),
              readFileString: () => Effect.succeed(JSON.stringify(taskData)),
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(result).toHaveLength(1);
      expect(result[0]?.subject).toBe("Normalized path task");
    });
  });

  describe("getTask", () => {
    it("fails when project metadata directory does not exist", async () => {
      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.getTask("/non/existent/project", "1");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: () => Effect.succeed(false),
            }),
          ),
          Effect.provide(testPathLayer),
          Effect.either,
        ),
      );

      expect(result._tag).toBe("Left");
    });

    it("fails when task file does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789abc";
      const claudeDir = getClaudeDir();
      const projectMetaDir = join(claudeDir, "projects", "-test-project");
      const tasksDir = join(claudeDir, "tasks", uuid);

      const existsMap = new Map<string, boolean>([
        [projectMetaDir, true],
        [tasksDir, true],
        [join(tasksDir, "1.json"), false],
      ]);

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.getTask("/test/project", "1");
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => Effect.succeed(existsMap.get(path) ?? false),
              readDirectory: (path) => {
                if (path === projectMetaDir) {
                  return Effect.succeed([`${uuid}.json`]);
                }
                return Effect.succeed([]);
              },
              stat: () => Effect.succeed(createFileInfo({})),
            }),
          ),
          Effect.provide(testPathLayer),
          Effect.either,
        ),
      );

      expect(result._tag).toBe("Left");
    });
  });

  describe("createTask", () => {
    it("creates directory and task when directory does not exist", async () => {
      const uuid = "12345678-1234-1234-1234-123456789abc";
      const claudeDir = getClaudeDir();
      const projectMetaDir = join(claudeDir, "projects", "-test-project");
      const tasksDir = join(claudeDir, "tasks", uuid);

      let directoryCreated = false;

      const existsMap = new Map<string, boolean>([
        [projectMetaDir, true],
        [tasksDir, false], // Tasks dir does not exist initially
      ]);

      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.createTask("/test/project", {
          subject: "New task",
          description: "New description",
        });
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: (path) => Effect.succeed(existsMap.get(path) ?? false),
              readDirectory: (path) => {
                if (path === projectMetaDir) {
                  return Effect.succeed([`${uuid}.json`]);
                }
                // Empty tasks directory after creation
                return Effect.succeed([]);
              },
              stat: () => Effect.succeed(createFileInfo({})),
              makeDirectory: () => {
                directoryCreated = true;
                return Effect.void;
              },
              writeFileString: () => Effect.void,
            }),
          ),
          Effect.provide(testPathLayer),
        ),
      );

      expect(directoryCreated).toBe(true);
      expect(result.subject).toBe("New task");
      expect(result.id).toBe("1");
    });
  });

  describe("updateTask", () => {
    it("fails when project metadata directory does not exist", async () => {
      const program = Effect.gen(function* () {
        const tasksService = yield* TasksService;
        return yield* tasksService.updateTask("/non/existent/project", {
          taskId: "1",
          subject: "Updated",
        });
      });

      const result = await Effect.runPromise(
        program.pipe(
          Effect.provide(TasksService.Live),
          Effect.provide(
            testFileSystemLayer({
              exists: () => Effect.succeed(false),
            }),
          ),
          Effect.provide(testPathLayer),
          Effect.either,
        ),
      );

      expect(result._tag).toBe("Left");
    });
  });
});
