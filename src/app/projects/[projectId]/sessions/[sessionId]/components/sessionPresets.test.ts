import { describe, expect, it } from "vitest";
import { getSessionPresetById, sessionPresets } from "./sessionPresets";

describe("sessionPresets", () => {
  it("provides fixed presets", () => {
    expect(sessionPresets).toHaveLength(12);
    expect(sessionPresets.map((preset) => preset.label)).toEqual([
      "Latest Sync",
      "🚀 Server Launch",
      "Admin App",
      "Backend API起動",
      "モバイルアプリ (Flutter)環境構築",
      "Monorepo管理",
      "Customer App開発",
      "Admin App起動",
      "🗂️ Bug収集",
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
      "Step 0: 環境確認",
    );
    expect(getSessionPresetById("test-case-review")?.initialMessage).toContain(
      "name: qa-review",
    );
    expect(getSessionPresetById("admin-app")?.initialMessage).toContain(
      "npm run dev:local  # http://localhost:3001",
    );
    expect(
      getSessionPresetById("monorepo-management")?.initialMessage,
    ).toContain("npm run format");
    expect(
      getSessionPresetById("customer-app-development")?.initialMessage,
    ).toContain("npm run dev:remote");
    expect(getSessionPresetById("admin-app-start")?.initialMessage).toContain(
      "typescript/apps/admin/",
    );
    expect(getSessionPresetById("backend-api-start")?.initialMessage).toContain(
      "make test-local",
    );
    expect(
      getSessionPresetById("mobile-app-flutter-setup")?.initialMessage,
    ).toContain("name: mobile-setup");
    expect(getSessionPresetById("bug-collection")?.initialMessage).toContain(
      "name: bug-collect",
    );
    expect(getSessionPresetById("unknown")).toBeUndefined();
  });
});
