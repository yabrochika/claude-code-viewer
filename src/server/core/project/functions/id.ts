import { dirname } from "node:path";

export const encodeProjectId = (fullPath: string) => {
  return Buffer.from(fullPath).toString("base64url");
};

export const decodeProjectId = (id: string) => {
  return Buffer.from(id, "base64url").toString("utf-8");
};

export const encodeProjectIdFromSessionFilePath = (sessionFilePath: string) => {
  const projectPath = dirname(sessionFilePath)
    .replace(/\\/g, "/")
    .replace(/^[A-Za-z]:(?=\/)/, "");

  return encodeProjectId(projectPath);
};
