import { describe, expect, it } from "vitest";
import { getSessionPresetById, sessionPresets } from "./sessionPresets";

describe("sessionPresets", () => {
  it("provides fixed presets", () => {
    expect(sessionPresets).toHaveLength(5);
    expect(sessionPresets.map((preset) => preset.label)).toEqual([
      "Latest Sync",
      "🚀 Server Launch",
      "📝 テストケース作成",
      "🐞 DefectをStory化",
      "🔍 テストケースレビュー",
    ]);
  });

  it("resolves preset by id", () => {
    expect(getSessionPresetById("server-start")?.initialMessage).toContain(
      "name: server-launch",
    );
    expect(getSessionPresetById("server-start")?.initialMessage).toContain(
      "## 🚀 クイックスタート",
    );
    expect(getSessionPresetById("unknown")).toBeUndefined();
  });
});
