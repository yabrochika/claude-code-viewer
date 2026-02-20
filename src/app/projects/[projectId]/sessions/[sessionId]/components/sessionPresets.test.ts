import { describe, expect, it } from "vitest";
import { getSessionPresetById, sessionPresets } from "./sessionPresets";

describe("sessionPresets", () => {
  it("provides fixed presets", () => {
    expect(sessionPresets).toHaveLength(5);
    expect(sessionPresets.map((preset) => preset.label)).toEqual([
      "Latest Sync",
      "🚀 Start Server",
      "📝 テストケース作成",
      "🐞 DefectをStory化",
      "🔍 テストケースレビュー",
    ]);
  });

  it("resolves preset by id", () => {
    expect(getSessionPresetById("server-start")?.initialMessage).toBe(
      "サーバー起動は @server_local_environment_setup.md の手順に従って実施してください。",
    );
    expect(getSessionPresetById("unknown")).toBeUndefined();
  });
});
