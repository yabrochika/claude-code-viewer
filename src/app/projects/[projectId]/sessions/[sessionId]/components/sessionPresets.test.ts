import { describe, expect, it } from "vitest";
import { getSessionPresetById, sessionPresets } from "./sessionPresets";

describe("sessionPresets", () => {
  it("provides fixed presets", () => {
    expect(sessionPresets).toHaveLength(5);
    expect(sessionPresets.map((preset) => preset.label)).toEqual([
      "Latest Sync",
      "🚀 Start Server",
      "📝 Create Test Cases",
      "🐞 DefectをStory化",
      "🔍 テストケースレビュー",
    ]);
  });

  it("resolves preset by id", () => {
    expect(getSessionPresetById("server-start")?.initialMessage).toBe(
      "Start the server by following @server_local_environment_setup.md.",
    );
    expect(getSessionPresetById("unknown")).toBeUndefined();
  });
});
