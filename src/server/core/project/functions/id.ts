export const encodeProjectId = (fullPath: string) => {
  return Buffer.from(fullPath).toString("base64url");
};

export const decodeProjectId = (id: string) => {
  return Buffer.from(id, "base64url").toString("utf-8");
};

export const encodeProjectIdFromSessionFilePath = (sessionFilePath: string) => {
  const normalizedSessionFilePath = sessionFilePath.replace(/\\/g, "/");
  const lastSlashIndex = normalizedSessionFilePath.lastIndexOf("/");
  const projectPath =
    lastSlashIndex >= 0
      ? normalizedSessionFilePath.slice(0, lastSlashIndex)
      : normalizedSessionFilePath;

  return encodeProjectId(projectPath);
};
