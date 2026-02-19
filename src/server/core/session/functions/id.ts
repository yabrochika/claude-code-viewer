import { basename, extname } from "node:path";
import { decodeProjectId } from "../../project/functions/id";

export const encodeSessionId = (jsonlFilePath: string) => {
  return basename(jsonlFilePath, extname(jsonlFilePath));
};

export const decodeSessionId = (projectId: string, sessionId: string) => {
  const projectPath = decodeProjectId(projectId);
  const normalizedProjectPath = projectPath.endsWith("/")
    ? projectPath.slice(0, -1)
    : projectPath;

  return `${normalizedProjectPath}/${sessionId}.jsonl`;
};
