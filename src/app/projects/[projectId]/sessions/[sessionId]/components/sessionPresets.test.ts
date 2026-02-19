import { describe, expect, it } from "vitest";
import { getSessionPresetById, sessionPresets } from "./sessionPresets";

describe("sessionPresets", () => {
  it("provides fixed presets", () => {
    expect(sessionPresets).toHaveLength(5);
    expect(sessionPresets.map((preset) => preset.label)).toEqual([
      "🐞 新規バグ収集",
      "最新取得",
      "🚀 Server起動",
      "📝 テストケース作成",
      "🔍 テストケースレビュー",
    ]);
  });

  it("resolves preset by id", () => {
    expect(getSessionPresetById("server-start")?.initialMessage).toBe(
      "@server_local_environment_setup.md に従ってServerを起動して",
    );
    expect(getSessionPresetById("unknown")).toBeUndefined();
  });
});
