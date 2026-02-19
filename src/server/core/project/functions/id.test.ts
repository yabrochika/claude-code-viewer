import {
  decodeProjectId,
  encodeProjectId,
  encodeProjectIdFromSessionFilePath,
} from "./id";

const sampleProjectPath =
  "/path/to/claude-code-project-dir/projects/sample-project";
const sampleProjectId =
  "L3BhdGgvdG8vY2xhdWRlLWNvZGUtcHJvamVjdC1kaXIvcHJvamVjdHMvc2FtcGxlLXByb2plY3Q";

describe("encodeProjectId", () => {
  it("should encode project id from project path", () => {
    expect(encodeProjectId(sampleProjectPath)).toBe(sampleProjectId);
  });
});

describe("decodeProjectId", () => {
  it("should decode project absolute path from project id", () => {
    expect(decodeProjectId(sampleProjectId)).toBe(sampleProjectPath);
  });
});

describe("encodeProjectIdFromSessionFilePath", () => {
  it("should encode project id from session file path", () => {
    expect(
      encodeProjectIdFromSessionFilePath(
        `${sampleProjectPath}/sample-session-id.jsonl`,
      ),
    ).toBe(sampleProjectId);
  });

  it("keeps Windows drive letter in encode-decode roundtrip", () => {
    const windowsSessionFilePath =
      "C:\\Users\\tester\\projects\\sample-project\\sample-session-id.jsonl";
    const encoded = encodeProjectIdFromSessionFilePath(windowsSessionFilePath);
    const decoded = decodeProjectId(encoded);

    expect(decoded).toBe("C:/Users/tester/projects/sample-project");
  });
});
